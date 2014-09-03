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

    return render(request, '03_05_total_manage.html', p)


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

    return render(request, '03_05_each_manage.html', p)


