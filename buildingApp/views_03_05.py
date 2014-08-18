# -*- coding: utf-8 -*-

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from django.db.models import Q
import json
from buildingApp.models import *
from django.conf import settings
from django.utils import simplejson
import os
from django.contrib.auth.decorators import permission_required

################################################
#################### Chap.3 ####################
################################################

def setPostData(request, typestr = ''):
    param = {}
    if request.method == 'GET':
        import datetime
        ym = datetime.datetime.now()
        param['search_year'] = int(ym.year)
        param['search_month'] = int(ym.month)
        param['search_building_id'] = int(BuildingInfo.objects.all().order_by('id')[0].id)
        param['search_room_num'] = ''
    	param['search_is_empty'] = 'false'
    elif request.method == 'POST':
        param['search_year'] = int(request.POST['year'])
        param['search_month'] = int(request.POST['month'])
        param['search_building_id'] = int(request.POST['building_id'])
        param['search_room_num'] = str(request.POST['room_num'])
    	param['search_is_empty'] = request.POST['is_empty']

    building = BuildingInfo.objects.all().order_by('id')
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
        if int(b.id) == int(param['search_building_id']):
            param['cur_building_name'] = str(b.name)

	param['min_building_id'] = building_name_id[0]['id']
    param['building_name_id'] = building_name_id
    search_year_list = []
    for i in range(2013, 2017):
        search_year_list.append(i)
    search_month_list = []
    for i in range(1, 13):
        search_month_list.append(i)
    param['search_year_list'] = search_year_list
    param['search_month_list'] = search_month_list

    if str(typestr) != 'payment':
        # E, G, W => get excel file info.
        try:
            excelInfo = ExcelFiles.objects.get(year = param['search_year'], month = param['search_month'], building = param['search_building_id'], type = str(typestr))
            param['excel_filename'] = str(excelInfo.filename)
            param['excel_uploadDate'] = prettyDate(excelInfo.uploadDate)
            param['excel_id'] = int(excelInfo.id)
        except:
            param['excel_filename'] = '업로드 된 파일이 없습니다.'
            param['excel_uploadDate'] = ''
            param['excel_id'] = ''

    #재실 정보
    rooms = RoomInfo.objects.filter(building = param['search_building_id'])
    occRooms = rooms.filter(isOccupied = True)
    param['num_of_rooms'] = len(rooms)
    param['num_of_occ_rooms'] = len(occRooms)
    param['num_of_jeon_rooms'] = len(occRooms.filter(nowResident__leaseType = u'전세'))
    param['num_of_woel_rooms'] = len(occRooms.filter(nowResident__leaseType = u'월세'))
    param['num_of_empty_rooms'] = len(rooms) - len(occRooms)

    total_deposit = 0
    total_lease = 0
    total_maintenance = 0
    total_parking = 0
    total_surtax = 0
    for room in occRooms:
        total_deposit += room.nowResident.leaseDeposit
        total_lease += room.nowResident.leaseMoney
        total_maintenance += room.nowResident.maintenanceFee
        total_parking += room.nowResident.parkingFee
        total_surtax += room.nowResident.surtax
    param['total_deposit'] = total_deposit
    param['total_lease'] = total_lease
    param['total_maintenance'] = total_maintenance
    param['total_parking'] = total_parking
    param['total_surtax'] = total_surtax


    roomid = ''
    if param['search_room_num'] != '':
        roomid = RoomInfo.objects.filter(building_id = int(param['search_building_id']), roomnum = int(param['search_room_num']))[0]
        roomid = roomid.id

    #고지 정보
    completeNotice = EachMonthInfo.objects.filter(year = param['search_year'], month = param['search_month'], building_id = param['search_building_id'], inputCheck = True, noticeCheck = True)
    if roomid != '':
        completeNotice = completeNotice.filter(room_id = int(roomid))
		
    param['num_of_complete_notice'] = len(completeNotice)
    param['num_of_ncomplete_notice'] = len(occRooms) - len(completeNotice)
    import datetime
    param['num_of_complete_notice_today'] = len(completeNotice.filter(noticeDate = datetime.date.today()))
    #납부 정보
    completePayment = PaymentInfo.objects.filter(year = param['search_year'], month = param['search_month'], building_id = param['search_building_id'], payStatus = -1)
    #if room_id != '':
    #        completePayment = completePayment.filter(room_id = int(room_id))
    param['num_of_comp_pay'] = len(completePayment)
    param['num_of_ncomp_pay'] = len(occRooms) - len(completePayment)
    param['num_of_comp_pay_today'] = len(completePayment.filter(payDate = datetime.date.today()))
    #입력 정보
    completeInput = EachMonthInfo.objects.filter(year = param['search_year'], month = param['search_month'], building_id = param['search_building_id'], inputCheck = True)
    if roomid != '':
        completeInput = completeInput.filter(room_id = int(roomid))
    param['num_of_comp_input'] = len(completeInput)
    param['num_of_ncomp_input'] = len(occRooms) - len(completeInput)
    param['num_of_comp_input_today'] = len(completeInput.filter(inputDate = datetime.date.today()))

    return param


"""
@permission_required('buildingApp.lease_bill', login_url='/login/')
def lease_notice_detail_show_html(request, bid, rid, tab):
    param = {}
    param['tab'] = int(tab)
    param['resident'] = ResidentInfo.objects.get(id = int(rid))
    param['building_name'] = BuildingInfo.objects.get(id = int(bid)).name
    param['building_id'] = int(bid)
    param['simpleLeaseDeposit'] = int(param['resident'].leaseDeposit) / int(10000)
    param['simpleLeaseMoney'] = int(param['resident'].leaseMoney) / int(10000)
    param['leaseNumberTotal'] = int(param['resident'].leaseNumberTotal)
    param['leaseNumberList'] = range(1, param['leaseNumberTotal']+1)
    return render(request, '03_01_lease_notice_detail_show.html', param)
"""

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_show_html(request):
    return render(request, '03_05_bill_show.html', setPostData(request))

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_input_html(request):
    return render(request, '03_05_total_input.html', setPostData(request))

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_look_html(request):
    return render(request, '03_05_total_look.html', setPostData(request))

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_manage_html(request):
    return render(request, '03_05_total_manage.html', setPostData(request))














