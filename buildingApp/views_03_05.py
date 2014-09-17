# -*- coding: utf-8 -*-
import base64
import mimetypes
import json
import os
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from django.db.models import Q
from buildingApp.models import *
from django.conf import settings
from django.utils import simplejson
from django.core import serializers
from django.contrib.auth.decorators import permission_required

mimetypes.init()

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
            param['cur_bid'] = int(b.id)

	param['min_building_id'] = building_name_id[0]['id']
    param['building_name_id'] = building_name_id
    search_year_list = []
    for i in range(2012, 2016):
        search_year_list.append(i)
    search_month_list = []
    for i in range(1, 13):
        search_month_list.append(i)
    param['search_year_list'] = search_year_list
    param['search_month_list'] = search_month_list

    return param


@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_show_html(request):
    import datetime
    ymd = datetime.date.today()
    curYear = int(ymd.year)
    curMonth = int(ymd.month)
    fstYear = int(2014)
    fstMonth = int(8)

    param = {}
    data = StandardBill.objects.all()
    if request.method == 'GET':
        param['search_type'] = int(1)
        param['search_building_id'] = int( BuildingInfo.objects.all()[0].id )
    elif request.method == 'POST':
        param['search_type'] = int(request.POST['type'])
        param['search_building_id'] = int(request.POST['building_id'])
        param['search_year'] = int(request.POST['year'])
        if param['search_year'] != -1:
            curYear = param['search_year']
            fstYear = param['search_year']
        param['search_month'] = int(request.POST['month'])
        if param['search_month'] != -1:
            curMonth = param['search_month']
            fstMonth = param['search_month']
        param['search_room_num'] = str(request.POST['room_num'])
    	param['search_is_empty'] = request.POST['is_empty']
        if param['search_type'] != 0:
            data = data.filter(type = param['search_type'])
        elif param['search_building_id'] != -1:
            data = data.filter(building_id = param['search_building_id'])
        elif param['search_year'] != -1:
            data = data.filter(year = param['search_year'])
        elif param['search_month'] != -1:
            data = data.filter(month = param['search_month'])
        #elif param['search_room_num'] != -1:
        #data = data.filter(

    params = {}
    allNoti = []
    eachNoti = []

    # 전체 안내 
    if param['search_type'] != 2:
		y = int(fstYear-1)
		while y+1 <= curYear:
			y += 1
			m = fstMonth
			if y > fstYear:
				m = 1
			to = 12
			if y == curYear:
				to = curMonth
			while m <= to:
				bi = BuildingInfo.objects
				if param['search_building_id'] == -1:
					bi = bi.all()
				else:
					bi = bi.filter(id = param['search_building_id'])
				for b in bi:
					p = {}
					p['year'] = y
					p['month'] = m
					p['bname'] = str(b.name)
					p['manager'] = str(b.manager)
					p['allroom'] = int(b.numRoom)
					p['numOfOccupied'] = len( RoomInfo.objects.filter(building = b, isOccupied = True) )
					cnt = 0
					for d in data:
						if d.type == 1 and y == d.year and m == d.month and d.building_id == int(b.id):
							cnt += 1
					p['numOfNotice'] = int(cnt)
					p['bid'] = int(b.id)
					allNoti.append(p)
				m += 1

    # 개별 안내
    if param['search_type'] != 1:
		y = int(fstYear-1)
		while y+1 <= curYear:
			y += 1
			m = fstMonth
			if y > fstYear:
				m = 1
			to = 12
			if y == curYear:
				to = curMonth
			while m <= to:
				ri = RoomInfo.objects.all()
				for r in ri:
					p = {}
					p['year'] = y
					p['month'] = m
					if int(r.building_id) != param['search_building_id'] and param['search_building_id'] != -1:
						continue
					bi = BuildingInfo.objects.get(id = int(r.building_id))
					p['bname'] = str(bi.name)
					p['roomnum'] = int(r.roomnum)
					p['isOccupied'] = int(r.isOccupied)
					p['residentName'] = ''
					p['residentGender'] = ''
					if r.nowResident != None:
						resident = ResidentInfo.objects.get(id = int(r.nowResident_id))
						p['residentName'] = str(resident.residentName)
						p['residentGender'] = str(resident.residentGender)
					cnt = 0
					for d in data:
						if d.type == 2 and y == d.year and m == d.month and d.room_id == int(r.id):
							cnt += 1
					p['numOfNotice'] = int(cnt)
					p['bid'] = int(bi.id)
					p['roomid'] = int(r.id)
					eachNoti.append(p)
				m += 1

    params['all'] = allNoti
    params['each'] = eachNoti
    params['all_len'] = len(allNoti)
    params['each_len'] = len(eachNoti)
    params['type'] = int(param['search_type'])
           
    return render(request, '03_05_bill_show.html', dict(setPostData(request).items() + params.items()))



####################################################################
### 전체 안내 관련 함수들 ###
####################################################################

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_input_html(request, bid, year, month):
    p = {}
    p['year'] = int(year)
    p['month'] = int(month)
    bi = BuildingInfo.objects.get(id = int(bid))
    p['bid'] = int(bid)
    p['bname'] = str(bi.name)
    p['manager'] = str(bi.manager)
    p['allroom'] = int(bi.numRoom)
    p['numOfOccupied'] = len( RoomInfo.objects.filter(building = bi, isOccupied = True) )
    sb = StandardBill.objects.filter(type = int(1), year = int(year), month = int(month), building = bi)
    dataArr = []
    cnt = 1
    for s in sb:
        pa = {}
        pa['number'] = cnt
        pa['id'] = int(s.id)
        cnt += 1
        pa['managerName'] = str(s.managerName)
        pa['inputDate'] = str(s.inputDate).replace('-','.')
        pa['category'] = int(s.category)
        pa['memo'] = str(s.memo)
        dataArr.append(pa)
    p['data'] = dataArr
    p['data_id'] = []
    for s in sb:
        p['data_id'].append(int(s.id))
    p['numData'] = len(p['data'])
    return render(request, '03_05_total_input.html', p)

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_input_confirm(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        type = int(request.POST['type'])
        bid = int(request.POST['bid'])
        #arr = request.POST.getlist('arr[]')
        ids = request.POST.getlist('ids[]')
        names = request.POST.getlist('names[]')
        dates = request.POST.getlist('dates[]')
        categories = request.POST.getlist('categories[]')
        memos = request.POST.getlist('memos[]')
        removes = request.POST.getlist('removes[]')
        
        for i in range(len(ids)):
            sb = None
            if int(ids[i]) < 0:
                sb = StandardBill()
            else:
                sb = StandardBill.objects.get(id = int(ids[i]))
            sb.year = int(y)
            sb.month = int(m)
            sb.type = int(type)
            sb.building_id = int(bid)
            sb.managerName = str(names[i])
            sb.category = int(categories[i])
            sb.inputDate = str(dates[i].replace('.','-'))
            sb.memo = str(memos[i])
            sb.status = 0
            sb.save()

        StandardBill.objects.filter(id__in = removes).delete()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')
	
	
@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_look_html(request, bid, year, month, searchYear):
    p = {}
    p['searchYear'] = int(searchYear)
    p['year'] = int(year)
    p['month'] = int(month)
    bi = BuildingInfo.objects.get(id = int(bid))
    p['bid'] = int(bid)
    p['bname'] = str(bi.name)
    p['manager'] = str(bi.manager)
    p['allroom'] = int(bi.numRoom)
    p['numOfOccupied'] = len( RoomInfo.objects.filter(building = bi, isOccupied = True) )

    sb = StandardBill.objects.filter(type = int(1), building = bi, year = int(searchYear)).order_by('-month')

    arr = []
    for i in range(12):
        pa = {}
        pa['yymm'] = str(searchYear)+'/'+str(i+1)
        pa['cnt'] = int(0)
        pa['data'] = []
        arr.append(pa)

    for s in sb:
        arr[int(s.month)-1]['cnt'] += 1
        pa = {}
        pa['number'] = int(arr[int(s.month)-1]['cnt'])
        pa['manager'] = str(s.managerName)
        pa['date'] = str(s.inputDate).replace('-','.')
        pa['category'] = int(s.category)
        pa['memo'] = str(s.memo)
        arr[int(s.month)-1]['data'].append(pa)

    yearmonth = []
    m = int(12)
    while m > 0:
        if arr[m-1]['cnt'] > 0:
            yearmonth.append(arr[m-1])
        m -= 1
    p['yearmonth'] = yearmonth

    return render(request, '03_05_total_look.html', p)


@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_manage_html(request, bid, year, month, searchYear):
    p = {}
    p['searchYear'] = int(searchYear)
    p['year'] = int(year)
    p['month'] = int(month)
    bi = BuildingInfo.objects.get(id = int(bid))
    p['bid'] = int(bid)
    p['bname'] = str(bi.name)
    p['manager'] = str(bi.manager)
    p['allroom'] = int(bi.numRoom)
    p['numOfOccupied'] = len( RoomInfo.objects.filter(building = bi, isOccupied = True) )

    sb = StandardBill.objects.filter(type = int(1), building = bi, year = int(searchYear)).order_by('-month')

    arr = []
    for i in range(12):
        pa = {}
        pa['yymm'] = str(searchYear)+'/'+str(i+1)
        pa['yymm_'] = str(searchYear)+'_'+str(i+1)
        pa['cnt'] = int(0)
        pa['data'] = []
        arr.append(pa)

    for s in sb:
        arr[int(s.month)-1]['cnt'] += 1
        pa = {}
        pa['number'] = int(arr[int(s.month)-1]['cnt'])
        pa['manager'] = str(s.managerName)
        pa['date'] = str(s.inputDate).replace('-','.')
        pa['category'] = int(s.category)
        pa['memo'] = str(s.memo)
        pa['id'] = int(s.id)
        arr[int(s.month)-1]['data'].append(pa)

    yearmonth = []
    m = int(12)
    while m > 0:
        if arr[m-1]['cnt'] > 0:
            yearmonth.append(arr[m-1])
        m -= 1
    p['yearmonth'] = yearmonth

    p['data_id'] = []
    for s in sb:
        p['data_id'].append(int(s.id))

    return render(request, '03_05_total_manage.html', p)

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_total_manage_confirm(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        type = int(request.POST['type'])
        bid = int(request.POST['bid'])
        ids = request.POST.getlist('ids[]')
        names = request.POST.getlist('names[]')
        dates = request.POST.getlist('dates[]')
        categories = request.POST.getlist('categories[]')
        memos = request.POST.getlist('memos[]')
        removes = request.POST.getlist('removes[]')
        
        for i in range(len(ids)):
            sb = None
            if str(ids[i][0]) == '-':
                sb = StandardBill()
            else:
                sb = StandardBill.objects.get(id = int(ids[i]))
                if int(sb.year) != int(y) or int(sb.month) != int(m):
                    continue
            sb.year = int(y)
            sb.month = int(m)
            sb.type = int(type)
            sb.building_id = int(bid)
            sb.managerName = str(names[i])
            sb.category = int(categories[i])
            sb.inputDate = str(dates[i].replace('.','-'))
            sb.memo = str(memos[i])
            sb.status = 0
            sb.save()

        StandardBill.objects.filter(id__in = removes).delete()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')



####################################################################
### 개별 안내 관련 함수들 ###
####################################################################

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_each_input_html(request, bid, roomid, year, month):
    p = {}
    p['year'] = int(year)
    p['month'] = int(month)
    p['bid'] = int(bid)
    p['roomid'] = int(roomid)
    bi = BuildingInfo.objects.get(id = int(bid))
    p['bname'] = str(bi.name)
    ri = RoomInfo.objects.get(id = int(roomid))
    p['isOccupied'] = int(ri.isOccupied)
    p['roomnum'] = int(ri.roomnum)
    resident = ResidentInfo.objects.get(buildingName = int(bi.id), buildingRoomNumber = int(ri.roomnum))
    p['residentName'] = str(resident.residentName)
    p['residentGender'] = str(resident.residentGender)

    sb = StandardBill.objects.filter(type = int(2), year = int(year), month = int(month), room = ri)
    dataArr = []
    cnt = 1
    for s in sb:
        pa = {}
        pa['number'] = cnt
        pa['id'] = int(s.id)
        cnt += 1
        pa['managerName'] = str(s.managerName)
        pa['inputDate'] = str(s.inputDate).replace('-','.')
        pa['category'] = int(s.category)
        pa['memo'] = str(s.memo)
        dataArr.append(pa)
    p['data'] = dataArr
    p['data_id'] = []
    for s in sb:
        p['data_id'].append(int(s.id))
    p['numData'] = len(p['data'])
    return render(request, '03_05_each_input.html', p)

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_each_input_confirm(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        type = int(request.POST['type'])
        bid = int(request.POST['bid'])
        roomid = int(request.POST['roomid'])
        ids = request.POST.getlist('ids[]')
        names = request.POST.getlist('names[]')
        dates = request.POST.getlist('dates[]')
        categories = request.POST.getlist('categories[]')
        memos = request.POST.getlist('memos[]')
        removes = request.POST.getlist('removes[]')
        
        for i in range(len(ids)):
            sb = None
            if int(ids[i]) < 0:
                sb = StandardBill()
            else:
                sb = StandardBill.objects.get(id = int(ids[i]))
            sb.year = int(y)
            sb.month = int(m)
            sb.type = int(type)
            sb.building_id = int(bid)
            sb.room_id = int(roomid)
            sb.managerName = str(names[i])
            sb.category = int(categories[i])
            sb.inputDate = str(dates[i].replace('.','-'))
            sb.memo = str(memos[i])
            sb.status = 0
            sb.save()

        StandardBill.objects.filter(id__in = removes).delete()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')
	
	
@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_each_look_html(request, bid, roomid, year, month, searchYear):
    p = {}
    p['searchYear'] = int(searchYear)
    p['year'] = int(year)
    p['month'] = int(month)
    p['bid'] = int(bid)
    p['roomid'] = int(roomid)
    bi = BuildingInfo.objects.get(id = int(bid))
    p['bname'] = str(bi.name)
    ri = RoomInfo.objects.get(id = int(roomid))
    p['isOccupied'] = int(ri.isOccupied)
    p['roomnum'] = int(ri.roomnum)
    resident = ResidentInfo.objects.get(buildingName = int(bi.id), buildingRoomNumber = int(ri.roomnum))
    p['residentName'] = str(resident.residentName)
    p['residentGender'] = str(resident.residentGender)

    sb = StandardBill.objects.filter(type = int(2), room = ri, year = int(searchYear)).order_by('-month')

    arr = []
    for i in range(12):
        pa = {}
        pa['yymm'] = str(searchYear)+'/'+str(i+1)
        pa['cnt'] = int(0)
        pa['data'] = []
        arr.append(pa)

    for s in sb:
        arr[int(s.month)-1]['cnt'] += 1
        pa = {}
        pa['number'] = int(arr[int(s.month)-1]['cnt'])
        pa['manager'] = str(s.managerName)
        pa['date'] = str(s.inputDate).replace('-','.')
        pa['category'] = int(s.category)
        pa['memo'] = str(s.memo)
        arr[int(s.month)-1]['data'].append(pa)

    yearmonth = []
    m = int(12)
    while m > 0:
        if arr[m-1]['cnt'] > 0:
            yearmonth.append(arr[m-1])
        m -= 1
    p['yearmonth'] = yearmonth

    return render(request, '03_05_each_look.html', p)


@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_each_manage_html(request, bid, roomid, year, month, searchYear):
    p = {}
    p['searchYear'] = int(searchYear)
    p['year'] = int(year)
    p['month'] = int(month)
    p['bid'] = int(bid)
    p['roomid'] = int(roomid)
    bi = BuildingInfo.objects.get(id = int(bid))
    p['bname'] = str(bi.name)
    ri = RoomInfo.objects.get(id = int(roomid))
    p['isOccupied'] = int(ri.isOccupied)
    p['roomnum'] = int(ri.roomnum)
    resident = ResidentInfo.objects.get(buildingName = int(bi.id), buildingRoomNumber = int(ri.roomnum))
    p['residentName'] = str(resident.residentName)
    p['residentGender'] = str(resident.residentGender)

    sb = StandardBill.objects.filter(type = int(2), room = ri, year = int(searchYear)).order_by('-month')

    arr = []
    for i in range(12):
        pa = {}
        pa['yymm'] = str(searchYear)+'/'+str(i+1)
        pa['yymm_'] = str(searchYear)+'_'+str(i+1)
        pa['cnt'] = int(0)
        pa['data'] = []
        arr.append(pa)

    for s in sb:
        arr[int(s.month)-1]['cnt'] += 1
        pa = {}
        pa['number'] = int(arr[int(s.month)-1]['cnt'])
        pa['manager'] = str(s.managerName)
        pa['date'] = str(s.inputDate).replace('-','.')
        pa['category'] = int(s.category)
        pa['memo'] = str(s.memo)
        pa['id'] = int(s.id)
        arr[int(s.month)-1]['data'].append(pa)

    yearmonth = []
    m = int(12)
    while m > 0:
        if arr[m-1]['cnt'] > 0:
            yearmonth.append(arr[m-1])
        m -= 1
    p['yearmonth'] = yearmonth
    p['room_id'] = []
    for s in sb:
        p['room_id'].append(int(s.id))

    p['data_id'] = []
    for s in sb:
        p['data_id'].append(int(s.id))

    return render(request, '03_05_each_manage.html', p)

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_each_manage_confirm(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        type = int(request.POST['type'])
        bid = int(request.POST['bid'])
        roomid = int(request.POST['roomid'])
        ids = request.POST.getlist('ids[]')
        names = request.POST.getlist('names[]')
        dates = request.POST.getlist('dates[]')
        categories = request.POST.getlist('categories[]')
        memos = request.POST.getlist('memos[]')
        removes = request.POST.getlist('removes[]')
        
        for i in range(len(ids)):
            sb = None
            if str(ids[i])[0] == '-':
                sb = StandardBill()
            else:
                sb = StandardBill.objects.get(id = int(ids[i]))
                if int(sb.year) != int(y) or int(sb.month) != int(m):
                    continue
            sb.year = int(y)
            sb.month = int(m)
            sb.type = int(type)
            sb.building_id = int(bid)
            sb.room_id = int(roomid)
            sb.managerName = str(names[i])
            sb.category = int(categories[i])
            sb.inputDate = str(dates[i].replace('.','-'))
            sb.memo = str(memos[i])
            sb.status = 0
            sb.save()

        StandardBill.objects.filter(id__in = removes).delete()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')

@permission_required('buildingApp.lease_bill', login_url='/login/')
def bill_each_print_html(request, roomid, y, m):
	ri = RoomInfo.objects.get(id = int(roomid))
	resident_id = int(ri.nowResident_id)
	return render(request, '03_05_bill_print.html', print_info(request, get_resident_info(resident_id), roomid, y, m))

def print_info(request, dic, roomid, y, m):
    if request.GET.get("print", None):
       dic['print'] = True
    dic['roomid'] = roomid
    dic['thisyear'] = y
    dic['thismonth'] = m
    return dic

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


def get_or_create(model, **kwargs):
    return model.objects.get_or_create(**kwargs)[0]

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

# 프린트할 때 필요한 데이터 가져오기
def get_bill_print_data(request, rid, roomid, y, m):
#item = get_or_create(LeaveOwner, resident_id = rid)
    resident = ResidentInfo.objects.get(id = int(rid))
    building = BuildingInfo.objects.get(id = int(resident.buildingName))
    em = EachMonthInfo.objects.get(resident_id = int(rid), room_id = int(roomid), year = int(y), month = int(m))
    electricity = ElectricityInfo.objects.get(resident_id = int(rid), year = int(y), month = int(m))
    gas = GasInfo.objects.get(resident_id = int(rid), year = int(y), month = int(m))
    water = WaterInfo.objects.get(resident_id = int(rid), year = int(y), month = int(m))
    electricity_period = ''
    gas_period = ''
    water_period = ''
    try:
        electricity_period = SettingBill.objects.get(building_id = int(building.id), type = 'electricity', month = int(m))
    except:
        pass
    try:
        gas_period = SettingBill.objects.get(building_id = int(building.id), type = 'gas', month = int(m))
    except:
        pass
    try:
        water_period = SettingBill.objects.get(building_id = int(building.id), type = 'water', month = int(m))
    except:
        pass
    notice_each = StandardBill.objects.filter(type = 2, year = int(y), month = int(m), room_id = int(roomid))
    notice_total = StandardBill.objects.filter(type = 1, year = int(y), month = int(m), building_id = int(building.id))

    payment = PaymentInfo.objects.filter(building_id = int(building.id), resident_id = int(rid), year__gte = int(y)-1).order_by('-year', '-month', '-id')
    payment_data = []
    for i in range(len(payment)):
        if i > 0 and payment[i].year == payment[i-1].year and payment[i].month == payment[i-1].month:
            continue
        payment_data.append(payment[i])

    result = {}
    result['thisyear'] = int(y)
    result['thismonth'] = int(m)
    result['nextmonth'] = int(m)+1
    result['dueDate'] = str(resident.inDate).split('-')[2].strip()
    if int(m) == 12:
        result['nextmonth'] = int(1)
    result['resident'] = convert_to_dict(resident)
    result['building'] = convert_to_dict(building)
    result['em'] = convert_to_dict(em)
    result['electricity'] = convert_to_dict(electricity)
    result['gas'] = convert_to_dict(gas)
    result['water'] = convert_to_dict(water)
    result['e_period'] = ''
    result['g_period'] = ''
    result['w_period'] = ''
    if electricity_period != '':
        result['e_period'] = str(electricity_period.startDate).replace('-','.') + ' ~ ' + str(electricity_period.endDate).replace('-','.')
	if gas_period != '':
		result['g_period'] = str(gas_period.startDate).replace('-','.') + ' ~ ' + str(gas_period.endDate).replace('-','.')
    if water_period != '':
		result['w_period'] = str(water_period.startDate).replace('-','.') + ' ~ ' + str(water_period.endDate).replace('-','.')
    result['notice_each'] = convert_to_dict( list(notice_each) )
    result['notice_total'] = convert_to_dict( list(notice_total) )
    result['payment'] = convert_to_dict( list(payment_data) )
    # 총합에 연체료 들어가야 함...
    result['totalFee'] = int(em.totalFee) + int(electricity.totalFee) + int(gas.totalFee) + int(water.totalFee)

    '''
    resident = item.resident
    resident_info = get_resident_info(rid)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        if resident.buildingName == b.id:
            building = b

    unpaiditems = list(item.leaveunpaiditem_set.all())
    payoffs = list(item.leavepayoff_set.all())
    reads = list(item.leaveread_set.all())
    unpaidaddeditems = list(item.leaveunpaidaddeditem_set.all())
    feeitems = list(item.leavefeeitem_set.all())
    confirms = list(item.leaveconfirm_set.all())

    result = convert_to_dict(item)
    result['building'] = convert_to_dict(building)
    result['resident'] = convert_to_dict(resident)
    result['resident']['fields']['buildingNameKor'] = resident_info['result'].buildingNameKor;
    result['resident']['fields']['roomNumber'] = resident_info['result'].roomNumber;

    result['unpaiditems'] = convert_to_dict(unpaiditems)
    result['payoffs'] = convert_to_dict(payoffs)
    result['reads'] = convert_to_dict(reads)
    result['unpaidaddeditems'] = convert_to_dict(unpaidaddeditems)
    result['feeitems'] = convert_to_dict(feeitems)
    result['confirms'] = convert_to_dict(confirms)
    '''
    return jsonResult(result)







