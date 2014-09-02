# -*- coding: utf-8 -*-
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from django.db.models import Q
import json
from buildingApp.models import *
from django.conf import settings
import os, datetime
from django.contrib.auth.models import User
from django.core import serializers

def get_or_create(model, **kwargs):
    return model.objects.get_or_create(**kwargs)[0]

def get_or_none(model, **kwargs):
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        return None

def jsonResult(result):
    return HttpResponse(convert_to_json(result), mimetype='application/json')

def convert_to_json(result):
    if type(result) == unicode or type(result) == str:
        return result
    elif type(result) == list:
        return serializers.serialize('json', result)
    elif type(result) == dict:
        return json.dumps(result)
    else:
        return serializers.serialize('json', [result])[1:-1]

def convert_to_dict(val):
    return json.loads(convert_to_json(val))

def get_leaveowner(request, rid): #rid
    item = get_or_create(LeaveOwner, resident_id = rid)

    resident = item.resident
    unpaiditems = list(item.leaveunpaiditem_set.all())
    payoffs = list(item.leavepayoff_set.all())
    reads = list(item.leaveread_set.all())
    unpaidaddeditems = list(item.leaveunpaidaddeditem_set.all())
    feeitems = list(item.leavefeeitem_set.all())

    result = convert_to_dict(item)
    result['resident'] = convert_to_dict(resident)
    result['unpaiditems'] = convert_to_dict(unpaiditems)
    result['payoffs'] = convert_to_dict(payoffs)
    result['reads'] = convert_to_dict(reads)
    result['unpaidaddeditems'] = convert_to_dict(unpaidaddeditems)
    result['feeitems'] = convert_to_dict(feeitems)

    return jsonResult(result)

def clear_and_save_items(queryset, items):
    queryset.all().delete()
    for item in items:
        child = queryset.create()
        for key in item:
            try:
                setattr(child, key, item[key])
            except:
                pass # please fix me
        child.save()

# POST method
def save_leaveowner(request, rid):
    item = get_or_create(LeaveOwner, resident_id = rid)

    obj = json.loads(request.body)

    if request.method == 'POST':
        obj = json.loads(request.body)

        for key in obj:
            val = obj[key]

            if key == 'resident':
                pass
            if key == 'unpaiditems':
                clear_and_save_items(item.leaveunpaiditem_set, val)
            if key == 'unpaidaddeditems':
                clear_and_save_items(item.leaveunpaidaddeditem_set, val)
            if key == 'feeitems':
                clear_and_save_items(item.leavefeeitem_set, val)
            if key == 'payoffs':
                clear_and_save_items(item.leavepayoff_set, val)
            if key == 'reads':
                clear_and_save_items(item.leaveread_set, val)
            else:
                try:
                    setattr(item, key, val)
                except:
                    pass # please fix me

        item.save()

    return get_leaveowner(request, rid)

def get_resident_info(uid):
    result = ResidentInfo.objects.get(id = uid)

    # 표기법 달리할 것들 처리하기
    import re
    result.inDate = re.sub('[년월일\-]+', '.', str(result.inDate))
    result.outDate = re.sub('[년월일\-]+', '.', str(result.outDate))
    result.realInDate = re.sub('[년월일\-]+', '.', str(result.realInDate))
    if result.realOutDate != None:
        result.realOutDate = re.sub('[년월일\-]+', '.', str(result.realOutDate))
    else:
        result.realOutDate = ''

    result.readDate = re.sub('[년월일\-]+', '.', str(result.readDate))

    #if result.itemCheckOut == 'y':
    #    if result.checkoutWhy == None:
    #        result.checkoutWhy = ''
    #    if result.checkoutDate == None:
    #         result.checkoutDate = ''
    #    result.checkoutDate = re.sub('[년월일\-]+', '.', str(result.checkoutDate))
    #else:
    #    result.checkoutWhy = ''
    #    result.checkoutDate = ''
    result.roomNumber = result.buildingRoomNumber
    if result.buildingRoomNumber < 0:
        result.roomNumber = 'B ' + str(-result.buildingRoomNumber)

    result.contractorRegNumber_1 = result.contractorRegNumber.split('-')[0]
    result.contractorRegNumber_2 = result.contractorRegNumber.split('-')[1]
    result.contractorContactNumber1_1 = result.contractorContactNumber1.split('-')[0]
    result.contractorContactNumber1_2 = result.contractorContactNumber1.split('-')[1]
    result.contractorContactNumber1_3 = result.contractorContactNumber1.split('-')[2]
    if result.contractorContactNumber2 != '':
        result.contractorContactNumber2_1 = result.contractorContactNumber2.split('-')[0]
        result.contractorContactNumber2_2 = result.contractorContactNumber2.split('-')[1]
        result.contractorContactNumber2_3 = result.contractorContactNumber2.split('-')[2]

    result.residentRegNumber_1 = result.residentRegNumber.split('-')[0]
    result.residentRegNumber_2 = result.residentRegNumber.split('-')[1]
    result.residentContactNumber1_1 = result.residentContactNumber1.split('-')[0]
    result.residentContactNumber1_2 = result.residentContactNumber1.split('-')[1]
    result.residentContactNumber1_3 = result.residentContactNumber1.split('-')[2]
    if result.residentContactNumber2 != '':
        result.residentContactNumber2_1 = result.residentContactNumber2.split('-')[0]
        result.residentContactNumber2_2 = result.residentContactNumber2.split('-')[1]
        result.residentContactNumber2_3 = result.residentContactNumber2.split('-')[2]
    if result.residentOfficeContactNumber != '':
        result.residentOfficeContactNumber_1 = result.residentOfficeContactNumber.split('-')[0]
        result.residentOfficeContactNumber_2 = result.residentOfficeContactNumber.split('-')[1]
        result.residentOfficeContactNumber_3 = result.residentOfficeContactNumber.split('-')[2]

    # 모든 건물 정보 가져오기
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
        if result.buildingName == b.id:
            result.buildingNameKor = b.name

    # 현재 빌딩에 따른 방 호실 가져오기
    floor = BuildingFloor.objects.filter(building_id = int(result.buildingName))
    rooms = []
    for r in floor:
        for n in range(1, r.roomNum+1):
            zero = ''
            if n < 10:
                zero = '0'
            if r.floor > 0:
                rooms.append({'num' : int(str(r.floor)+zero+str(n)), 'kor' : int(str(r.floor)+zero+str(n))})
            else:
                rooms.append({'num' : int(str(r.floor)+zero+str(n)), 'kor' : 'B '+str(-r.floor)+zero+str(n)})

    return {'result' : result, 'rooms' : rooms, 'building_name_id' : building_name_id, 'uid' : uid, 'range' : range(1, 32)}

def print_info(request, dic):
    if request.GET.get("print", None):
       dic['print'] = True 
    return dic

def leave_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
    return render(request, 'leave_main.html', {'building_name_id' : building_name_id, 'numOfBuilding' : len(building_name_id)})

def leave_owner_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_owner.html', get_resident_info(uid))

def leave_owner_print_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_owner_print.html', print_info(request, get_resident_info(uid)))

def leave_confirm_owner_print_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_confirm_owner_print.html', print_info(request, get_resident_info(uid)))

def leave_tenant_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_tenant.html', get_resident_info(uid))

def leave_tenant_print_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_tenant_print.html', print_info(request, get_resident_info(uid)))

def leave_confirm_tenant_print_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_confirm_tenant_print.html', print_info(request, get_resident_info(uid)))

def leave_confirm_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_confirm.html', get_resident_info(uid))

def leave_final_html(request, uid):
    csrf_token = get_token(request)
    return render(request, 'leave_final.html', get_resident_info(uid))

#def leave_html(request):
#    return render(request, 'leave_main.html', setPostData(request))

def setPostData(request, typestr = ''):
    param = {}
    if request.method == 'GET':
        import datetime
        ym = datetime.datetime.now()
        param['search_year'] = int(ym.year)
        param['search_month'] = int(ym.month)
        param['search_building_id'] = int(BuildingInfo.objects.all().order_by('id')[0].id)
    	param['search_is_empty'] = 'false'
    elif request.method == 'POST':
        param['search_year'] = int(request.POST['year'])
        param['search_month'] = int(request.POST['month'])
        param['search_building_id'] = int(request.POST['building_id'])
    	param['search_is_empty'] = request.POST['is_empty']

    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
        if int(b.id) == int(param['search_building_id']):
            param['cur_building_name'] = str(b.name)

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
    #고지 정보
    completeNotice = EachMonthInfo.objects.filter(year = param['search_year'], month = param['search_month'], building_id = param['search_building_id'], inputCheck = True, noticeCheck = True)
    param['num_of_complete_notice'] = len(completeNotice)
    param['num_of_ncomplete_notice'] = len(occRooms) - len(completeNotice)
    import datetime
    param['num_of_complete_notice_today'] = len(completeNotice.filter(noticeDate = datetime.date.today()))
    #납부 정보
    completePayment = PaymentInfo.objects.filter(year = param['search_year'], month = param['search_month'], building_id = param['search_building_id'], payStatus = -1)
    param['num_of_comp_pay'] = len(completePayment)
    param['num_of_ncomp_pay'] = len(occRooms) - len(completePayment)
    param['num_of_comp_pay_today'] = len(completePayment.filter(payDate = datetime.date.today()))
    #입력 정보
    completeInput = EachMonthInfo.objects.filter(year = param['search_year'], month = param['search_month'], building_id = param['search_building_id'], inputCheck = True)
    param['num_of_comp_input'] = len(completeInput)
    param['num_of_ncomp_input'] = len(occRooms) - len(completeInput)
    param['num_of_comp_input_today'] = len(completeInput.filter(inputDate = datetime.date.today()))

    return param


