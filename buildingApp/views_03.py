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
        param['search_building_id'] = 1
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

    return param

def lease_show_html(request):
    return render(request, '03_01_lease_show.html', setPostData(request))


def serialize_allInfo(notice, payment, leasePayDate):
    serialized_lease = []
    serialized_notice = []
    serialized_payment = []
    for n in notice:
        data = {}
        data['id'] = int(n.id)
        data['year'] = int(n.year)
        data['month'] = int(n.month)
        data['noticeNumber'] = int(n.noticeNumber)
        data['leaseMoney'] = int(n.leaseMoney)
        data['maintenanceFee'] = int(n.maintenanceFee)
        data['surtax'] = int(n.surtax)
        data['parkingFee'] = int(n.parkingFee)
        data['electricityFee'] = int(n.electricityFee)
        data['gasFee'] = int(n.gasFee)
        data['waterFee'] = int(n.waterFee)
        data['etcFee'] = int(n.etcFee)
        data['totalFee'] = int(n.totalFee)
        data['changedFee'] = ''
        if n.changedFee != None:
            data['changedFee'] = int(n.changedFee)
        data['noticeDate'] = ''
        if n.noticeDate != None:
            #data['noticeDate'] = str(n.noticeDate.month)+'.'+str(n.noticeDate.day)
            data['noticeDate'] = '.'.join(str(n.noticeDate).split('.')[1:])
        serialized_notice.append(data)
    for p in payment:
        data = {}
        data['id'] = int(p.id)
        data['year'] = int(p.year)
        data['month'] = int(p.month)
        data['number'] = int(p.number)
        data['totalFee'] = int(p.totalFee)
        data['amountPaySum'] = int(p.amountPaySum)
        data['amountPay'] = int(p.amountPay)
        data['amountNoPay'] = int(p.amountNoPay)
        data['confirmStatus'] = int(p.confirmStatus)
        data['payStatus'] = int(p.payStatus)
        data['delayNumberNow'] = int(p.delayNumberNow)
        data['delayNumberNext'] = int(p.delayNumberNext)
        data['payMsg'] = str(p.payMsg)
        data['modifyNumber'] = int(p.modifyNumber)
        data['leasePayDate'] = int(leasePayDate)
        data['payDate'] = ''
        data['confirmDate'] = ''
        if p.payDate != None:
            #data['payDate'] = str(p.payDate.year)+'.'+str(p.payDate.month)+'.'+str(p.payDate.day)
            data['payDate'] = str(p.payDate)
        if p.confirmDate != None:
            #data['confirmDate'] = str(p.confirmDate.year)+'.'+str(p.confirmDate.month)+'.'+str(p.confirmDate.day)
            data['confirmDate'] = str(p.confirmDate)
        serialized_payment.append(data)

    return [serialized_notice, serialized_payment]
    #return serialized

def lease_notice_detail_getAllInfo(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        leasePayDate = ResidentInfo.objects.get(id = int(rid)).leasePayDate

        #lease = ResidentInfo.objects.filter
        notice = EachMonthInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
        payment = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')

        #for l in param['lease_list']:
        #    l.inDate = str(l.inDate.year)+'.'+str(l.inDate.month)+'.'+str(l.inDate.day)
        #    l.outDate = str(l.outDate.year)+'.'+str(l.outDate.month)+'.'+str(l.outDate.day)
        for l in notice:
            if l.noticeDate != None:
                l.noticeDate = str(l.noticeDate.year)+'.'+str(l.noticeDate.month)+'.'+str(l.noticeDate.day)
            #if l.inputDate != None:
            #    l.inputDate = str(l.inputDate.year)+'.'+str(l.inputDate.month)+'.'+str(l.inputDate.day)
        for l in payment:
            if l.payDate != None:
                l.payDate = str(l.payDate.year)+'.'+str(l.payDate.month)+'.'+str(l.payDate.day)
            if l.confirmDate != None:
                l.confirmDate = str(l.confirmDate.year)+'.'+str(l.confirmDate.month)+'.'+str(l.confirmDate.day)
        #return HttpResponse(simplejson.dumps(param))
    	return toJSON(serialize_allInfo(notice, payment, leasePayDate))
    return HttpResponse('NOT POST')

def lease_notice_detail_show_html(request, bid, rid, tab):
    param = {}
    param['tab'] = int(tab)
    param['resident'] = ResidentInfo.objects.get(id = int(rid))
    param['building_name'] = BuildingInfo.objects.get(id = int(bid)).name
    param['building_id'] = int(bid)
    param['simpleLeaseDeposit'] = int(param['resident'].leaseDeposit) / int(10000)
    param['simpleLeaseMoney'] = int(param['resident'].leaseMoney) / int(10000)
    return render(request, '03_01_lease_notice_detail_show.html', param)

def notice_show_html(request):
    return render(request, '03_01_notice_show.html', setPostData(request))

def payment_show_html(request):
    return render(request, '03_01_payment_show.html', setPostData(request))

def get_lease_info(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
        is_empty = request.POST['is_empty']
        if is_empty == 'false':
        	data = RoomInfo.objects.filter(building_id = bid, isOccupied = True)
        else:
        	data = RoomInfo.objects.filter(building_id = bid)
    	return toJSON(serialize_lease(data))
    return HttpResponse('NOT POST')

def get_notice_info(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
        #fromWhere = 0(03_01_notice), 1(03_02_check), 2(03_02_notice)
        fromWhere = int(request.POST['fromWhere'])
    	data = EachMonthInfo.objects.filter(year = y, month = m, building = bid)
        if len(data) == 0:
            # create new data for new month
            import datetime
            nowYear = int(datetime.datetime.now().year)
            nowMonth = int(datetime.datetime.now().month)
            if nowYear == y and nowMonth == m:
                beforeYear = y
                beforeMonth = m-1
                if beforeMonth == 0:
                    beforeYear -= 1
                    beforeMonth = 12
                room = RoomInfo.objects.filter(building = bid).order_by('roomnum', '-residentnum')
                for i in range(len(room)):
                    if i > 0 and int(room[i].roomnum) == int(room[i-1].roomnum):
                        continue
                    em = EachMonthInfo()
                    em.building = room[i].building
                    em.resident = room[i].nowResident
                    em.year = y
                    em.month = m
                    beforeInfo = EachMonthInfo.objects.get(year = beforeYear, month = beforeMonth, building = bid, resident = em.resident)
                    if em.resident != None:
                        em.noticeNumber = int(beforeInfo.noticeNumber) + 1
                        em.leaseMoney = int(em.resident.leaseMoney)
                        em.maintenanceFee = int(em.resident.maintenanceFee)
                        em.surtax = int(em.resident.surtax)
                    else:
                        em.noticeNumber = 0
                        em.leaseMoney = 0
                        em.maintenanceFee = 0
                        em.surtax = 0
                    em.electricityFee = 0
                    em.waterFee = 0
                    em.gasFee = 0
                    em.etcFee = 0
                    em.totalFee = int(em.noticeNumber)+int(em.leaseMoney)+int(em.maintenanceFee)+int(em.surtax)
                    em.changedFee = 0
                    em.inputCheck = False
                    em.inputDate = None
                    em.noticeCheck = False
                    em.noticeDate = None
                    em.save()
    	    data = EachMonthInfo.objects.filter(year = y, month = m, building = bid)

    	return toJSON(serialize_notice(data, fromWhere))
    return HttpResponse('NOT POST')

def get_egw_info(request):
    if request.method == 'POST':
        type = str(request.POST['type'])
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
        data = None
        if type == "E":
            data = ElectricityInfo.objects.filter(year = y, month = m, building = bid)
            return toJSON(serialize_electricity(data))
        elif type == "G":
            data = GasInfo.objects.filter(year = y, month = m, building = bid)
            return toJSON(serialize_gas(data))
        elif type == "W":
            data = WaterInfo.objects.filter(year = y, month = m, building = bid)
            return toJSON(serialize_water(data))

        return HttpResponse('NO Matched Type')
    return HttpResponse('NOT POST')
        

def prettyDate(date):
    return str(date.year) + '.' + str(date.month) + '.' + str(date.day)

def prettyDateWOYear(date):
    return str(date.month) + '.' + str(date.day)
## prettify data for lease
def serialize_lease(result):
    serialized = []
    under = result.filter(roomnum__lt = 0).order_by('-roomnum') 
    over = result.filter(roomnum__gt = 0).order_by('roomnum')
    for chunk in (under,over):
        for room in chunk:
            data = {}
            if room.isOccupied:
                res = room.nowResident
                data['rid'] = res.id
                data['buildingnum'] = res.buildingName
                if res.buildingRoomNumber < 0:
                    data['roomnum'] = "B" + str(-1 * res.buildingRoomNumber)
                else:
                    data['roomnum'] = str(res.buildingRoomNumber)
                data['name'] = res.contractorName
                data['deposit'] = res.leaseDeposit
                data['money'] = res.leaseMoney
                data['maintenance'] = res.maintenanceFee
                data['surtax'] = res.surtax
                data['parking'] = res.parkingFee
                data['payway'] = res.leasePayWay
                data['paydate'] = res.leasePayDate
                data['indate'] = prettyDate(res.inDate)
                data['outdate'] = prettyDate(res.outDate)
            else:
                data['rid'] = -1 
                data['buildingnum'] = room.building_id
                if room.roomnum < 0:
                    data['roomnum'] = "B" + str(-1 * room.roomnum)
                else:
                    data['roomnum'] = str(room.roomnum)
                data['name'] = ''
                data['deposit'] = ''
                data['money'] = ''
                data['maintenance'] = ''
                data['surtax'] = ''
                data['parking'] = ''
                data['payway'] = ''
                data['paydate'] = ''
                data['indate'] = ''
                data['outdate'] = ''

            serialized.append(data)
    return serialized

## prettify data for notice
def serialize_notice(result, fromWhere): #, E, G, W):
    serialized = []
    for res in result:
        if (fromWhere == 0 and res.inputCheck and res.noticeCheck) or (fromWhere == 1) or (fromWhere == 2 and res.inputCheck):
            # if(res.inputCheck == True and res.noticeCheck == True):
            data = {}
            total = 0
            data['id'] = res.id
            data['inputCheck'] = res.inputCheck
            if res.inputDate != None:
                data['inputdate'] = prettyDateWOYear(res.inputDate)
            data['noticeCheck'] = res.noticeCheck
            if res.noticeDate != None:
                data['noticedate'] = prettyDateWOYear(res.noticeDate)
            data['building_id'] = res.building.id
            data['resident_id'] = res.resident.id
            data['buildingnum'] = res.resident.buildingName
            data['roomnum'] = res.resident.buildingRoomNumber
            data['name'] = res.resident.contractorName
            data['yearmonth'] = str(res.year) + "/" + str(res.month)
            data['noticeNumber'] = res.noticeNumber
            data['lease'] = res.leaseMoney
            data['maintenance'] = res.maintenanceFee
            data['surtax'] = res.surtax
            data['parking'] = res.parkingFee

            data['electricityFee'] = res.electricityFee
            data['gasFee'] = res.gasFee
            data['waterFee'] = res.waterFee

            data['etcFee'] = res.etcFee
            data['changedFee'] = res.changedFee
            data['totalFee'] = res.totalFee

            serialized.append(data)
    return serialized

## prettify data for electricity
def serialize_electricity(result):
    serialized = []
    for res in result:
        data = {}
        data['id'] = res.id
        data['roomnum'] = res.resident.buildingRoomNumber
        data['floor'] = int(data['roomnum']) / int(100)
        data['name'] = res.resident.contractorName
        data['date'] = prettyDate(res.resident.inDate) #res.resident.inDate
        data['checkE'] = res.resident.checkE
        data['usePeriod'] = res.usePeriod
        data['readBefore'] = res.readBefore
        data['readNow'] = res.readNow
        data['capacityBefore'] = res.capacityBefore
        data['capacityNow'] = res.capacityNow
        data['basicCharge'] = res.basicCharge
        data['useCharge'] = res.useCharge
        data['vat'] = res.vat
        data['fundE'] = res.fundE
        data['tvLicenseFee'] = res.tvLicenseFee
        data['trimmedFee'] = res.trimmedFee
        data['totalFee'] = res.totalFee
        serialized.append(data)
    return serialized

## prettify data for water
def serialize_water(result):
    serialized = []
    for res in result:
        data = {}
        data['id'] = res.id
        data['roomnum'] = res.resident.buildingRoomNumber
        data['floor'] = int(data['roomnum']) / int(100)
        data['name'] = res.resident.contractorName
        data['date'] = prettyDate(res.resident.inDate)
        data['checkW'] = res.resident.checkW
        data['usePeriod'] = res.usePeriod
        data['readBefore'] = res.readBefore
        data['readNow'] = res.readNow
        data['capacityBefore'] = res.capacityBefore
        data['capacityNow'] = res.capacityNow
        data['basicCharge'] = res.basicCharge
        data['waterSupplyCharge'] = res.waterSupplyCharge
        data['sewerageCharge'] = res.sewerageCharge
        data['waterUseCharge'] = res.waterUseCharge
        data['trimmedFee'] = res.trimmedFee
        data['totalFee'] = res.totalFee
        serialized.append(data)
    return serialized

## prettify data for gas
def serialize_gas(result):
    serialized = []
    for res in result:
        data = {}
        data['id'] = res.id
        data['roomnum'] = res.resident.buildingRoomNumber
        data['floor'] = int(data['roomnum']) / int(100)
        data['name'] = res.resident.contractorName
        data['date'] = prettyDate(res.resident.inDate)
        data['checkG'] = res.resident.checkG
        data['usePeriod'] = res.usePeriod
        data['readBefore'] = res.readBefore
        data['readNow'] = res.readNow
        data['capacityBefore'] = res.capacityBefore
        data['capacityNow'] = res.capacityNow
        data['readBeforeHotWater'] = res.readBeforeHotWater
        data['readBeforeHeat'] = res.readBeforeHeat
        data['readNowHotWater'] = res.readNowHotWater
        data['readNowHeat'] = res.readNowHeat
        data['capacityBeforeHotWater'] = res.capacityBeforeHotWater
        data['capacityBeforeHeat'] = res.capacityBeforeHeat
        data['capacityNowHotWater'] = res.capacityNowHotWater
        data['capacityNowHeat'] = res.capacityNowHeat
        data['basicCharge'] = res.basicCharge
        data['useCharge'] = res.useCharge
        data['vat'] = res.vat
        data['trimmedFee'] = res.trimmedFee
        data['totalFee'] = res.totalFee
        serialized.append(data)
    return serialized

def toJSON(objs, status=200):
    j = json.dumps(objs, ensure_ascii=False)
    return HttpResponse(j, status=status, content_type='application/json; charset=utf-8')

def electricity_show_html(request):
    return render(request, '03_01_electricity_show.html', setPostData(request, "electricity"))

def gas_show_html(request):
    return render(request, '03_01_gas_show.html', setPostData(request, "gas"))

def water_show_html(request):
    return render(request, '03_01_water_show.html', setPostData(request, "water"))


def excel_file_upload(request):
    if request.method == 'POST':
        if 'file' in request.FILES:
            building_info = BuildingInfo.objects.get(id = request.POST['building_id'])

            # save all data to proper db table
            # 1. get columnNames, eachLength, alldata
            col = request.POST.get('column').split(',')
            column = []
            for i in range(len(col)):
                column.append(col[i].strip())

            length = int(request.POST['length'])
            data = request.POST.get('data').split(',')
            result = []
            temp = []
            for i in range(len(data)):
                temp.append(data[i].strip())
                if i % length == length-1:
                    result.append(temp)
                    temp = []

            # 2. delete current data (not delete rightnow, it's executed after save new date)
            deleteObjs = None
            if str(request.POST['type']) == 'electricity':
                deleteObjs = ElectricityInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = building_info)
            elif str(request.POST['type']) == 'gas':
                deleteObjs = GasInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = building_info)
            elif str(request.POST['type']) == 'water':
                deleteObjs = WaterInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = building_info)
            
            # notice data update
            em = EachMonthInfo.objects.filter(building_id = int(request.POST['building_id']), year = int(request.POST['year']), month = int(request.POST['month']))

            # 3. save new data (not save rightnow, it's executed after gathering the data)
            newObjs = []
            if request.POST['type'] == 'electricity':
                for i in range(len(result)):
                    elem = ElectricityInfo()
                    temp_roomnum = 0
                    temp_name = ''
                    for j in range(len(result[i])):
                        if column[j] == '사용기간':
                            elem.usePeriod = int(result[i][j])
                        elif column[j] == '전월검침':
                            elem.readBefore = int(result[i][j])
                        elif column[j] == '당월검침':
                            elem.readNow = int(result[i][j])
                        elif column[j] == '전월사용량':
                            elem.capacityBefore = int(result[i][j])
                        elif column[j] == '당월사용량':
                            elem.capacityNow = int(result[i][j])
                        elif column[j] == '기본요금':
                            elem.basicCharge = int(result[i][j])
                        elif column[j] == '사용요금':
                            elem.useCharge = int(result[i][j])
                        elif column[j] == '부가가치세':
                            elem.vat = int(result[i][j])
                        elif column[j] == '전력기금':
                            elem.fundE = int(result[i][j])
                        elif column[j] == 'TV수신료':
                            elem.tvLicenseFee = int(result[i][j])
                        elif column[j] == '절사금액':
                            elem.trimmedFee = int(result[i][j])
                        elif column[j] == '합계금액':
                            elem.totalFee = int(result[i][j])
                        elif column[j] == '호수':
                            temp_roomnum = int(result[i][j])
                        elif column[j] == '입주자':
                            temp_name = str(result[i][j])
                    elem.resident = ResidentInfo.objects.get(buildingRoomNumber = temp_roomnum, contractorName = temp_name, buildingName = int(request.POST['building_id']))
                    elem.building = BuildingInfo.objects.get(id = building_info.id)
                    elem.year = int(request.POST['year'])
                    elem.month = int(request.POST['month'])
                    newObjs.append(elem)
                    #elem.save()
            elif request.POST['type'] == 'water':
                for i in range(len(result)):
                    elem = WaterInfo()
                    temp_roomnum = 0
                    temp_name = ''
                    for j in range(len(result[i])):
                        if column[j] == '사용기간':
                            elem.usePeriod = int(result[i][j])
                        elif column[j] == '전월검침':
                            elem.readBefore = int(result[i][j])
                        elif column[j] == '당월검침':
                            elem.readNow = int(result[i][j])
                        elif column[j] == '전월사용량':
                            elem.capacityBefore = int(result[i][j])
                        elif column[j] == '당월사용량':
                            elem.capacityNow = int(result[i][j])
                        elif column[j] == '기본요금':
                            elem.basicCharge = int(result[i][j])
                        elif column[j] == '상수도요금':
                            elem.waterSupplyCharge = int(result[i][j])
                        elif column[j] == '하수도요금':
                            elem.sewerageCharge = int(result[i][j])
                        elif column[j] == '물이용부담금':
                            elem.waterUseCharge = int(result[i][j])
                        elif column[j] == '절사금액':
                            elem.trimmedFee = int(result[i][j])
                        elif column[j] == '합계금액':
                            elem.totalFee = int(result[i][j])
                        elif column[j] == '호수':
                            temp_roomnum = int(result[i][j])
                        elif column[j] == '입주자':
                            temp_name = str(result[i][j])
                    elem.resident = ResidentInfo.objects.get(buildingRoomNumber = temp_roomnum, contractorName = temp_name, buildingName = int(request.POST['building_id']))
                    elem.building = BuildingInfo.objects.get(id = building_info.id)
                    elem.year = int(request.POST['year'])
                    elem.month = int(request.POST['month'])
                    newObjs.append(elem)
                    #elem.save()
            elif request.POST['type'] == 'gas':
                for i in range(len(result)):
                    elem = GasInfo()
                    temp_roomnum = 0
                    temp_name = ''
                    for j in range(len(result[i])):
                        if column[j] == '사용기간':
                            elem.usePeriod = int(result[i][j])
                        elif column[j] == '전월검침':
                            elem.readBefore = int(result[i][j])
                        elif column[j] == '당월검침':
                            elem.readNow = int(result[i][j])
                        elif column[j] == '전월사용량':
                            elem.capacityBefore = int(result[i][j])
                        elif column[j] == '당월사용량':
                            elem.capacityNow = int(result[i][j])
                        elif column[j] == '급탕전월검침':
                            elem.readBeforeHotWater = int(result[i][j])
                        elif column[j] == '난방전월검침':
                            elem.readBeforeHeat = int(result[i][j])
                        elif column[j] == '급탕당월검침':
                            elem.readNowHotWater = int(result[i][j])
                        elif column[j] == '난방당월검침':
                            elem.readNowHeat = int(result[i][j])
                        elif column[j] == '급탕전월사용량':
                            elem.capacityBeforeHotWater = int(result[i][j])
                        elif column[j] == '난방전월사용량':
                            elem.capacityBeforeHeat = int(result[i][j])
                        elif column[j] == '급탕당월사용량':
                            elem.capacityNowHotWater = int(result[i][j])
                        elif column[j] == '난방당월사용량':
                            elem.capacityNowHeat = int(result[i][j])
                        elif column[j] == '기본요금':
                            elem.basicCharge = int(result[i][j])
                        elif column[j] == '사용요금':
                            elem.useCharge = int(result[i][j])
                        elif column[j] == '부가가치세':
                            elem.vat = int(result[i][j])
                        elif column[j] == '절사금액':
                            elem.trimmedFee = int(result[i][j])
                        elif column[j] == '합계금액':
                            elem.totalFee = int(result[i][j])
                        elif column[j] == '호수':
                            temp_roomnum = int(result[i][j])
                        elif column[j] == '입주자':
                            temp_name = str(result[i][j])
                    elem.resident = ResidentInfo.objects.get(buildingRoomNumber = temp_roomnum, contractorName = temp_name, buildingName = int(request.POST['building_id']))
                    elem.building = BuildingInfo.objects.get(id = building_info.id)
                    elem.year = int(request.POST['year'])
                    elem.month = int(request.POST['month'])
                    newObjs.append(elem)
                    #elem.save()

            # delete old data
            for obj in deleteObjs:
                for elem in em:
                    if int(elem.resident.id) == int(obj.resident.id):
                        if request.POST['type'] == 'electricity':
                            elem.totalFee -= int(elem.electricityFee)
                            elem.electricityFee = 0
                        elif request.POST['type'] == 'gas':
                            elem.totalFee -= int(elem.gasFee)
                            elem.gasFee = 0
                        else:
                            elem.waterFee -= int(elem.waterFee)
                            elem.waterFee = 0
                        elem.save()
                        break
            deleteObjs.delete()

            # save new data
            for obj in newObjs:
                obj.save()
                for elem in em:
                    if int(elem.resident.id) == int(obj.resident.id):
                        if request.POST['type'] == 'electricity':
                            elem.electricityFee = obj.totalFee
                            elem.totalFee += int(elem.electricityFee)
                        elif request.POST['type'] == 'gas':
                            elem.gasFee = obj.totalFee
                            elem.totalFee += int(elem.gasFee)
                        else:
                            elem.waterFee = obj.totalFee
                            elem.waterFee += int(elem.waterFee)
                        elem.save()
                        break
                
            # save the info. into DB
            fileInfo = None
            try:
                fileInfo = ExcelFiles.objects.get(type = request.POST['type'], building = building_info.id, year = int(request.POST['year']), month = int(request.POST['month']))
                os.remove(os.path.join(settings.MEDIA_ROOT, request.POST['type']) + '/' + fileInfo.filename)
            except:
                fileInfo = ExcelFiles()
                print('new fileInfo')
            fileInfo.type = request.POST['type']
            fileInfo.building = building_info
            fileInfo.year = int(request.POST['year'])
            fileInfo.month = int(request.POST['month'])
            fileInfo.filename = request.POST['filename']
            fileInfo.uploadDate = request.POST['uploadDate'].replace('.', '-').strip()
            fileInfo.save()

            # save excel file
            file = request.FILES['file']
            filename = file._name
            fp = open('%s/%s/%s' % (settings.MEDIA_ROOT, request.POST['type'], filename), 'wb')
            for chunk in file.chunks():
                fp.write(chunk)
            fp.close()


            return HttpResponse('file upload - SUCCESS')
        return HttpResponse('file upload - NO FILE')
    return HttpResponse('file upload - NOT POST')

def excel_file_delete(request):
    if request.method == 'POST':
        fileInfo = ExcelFiles.objects.get(id = int(request.POST['file_id']))
        # delete the actual excel file
        os.remove(os.path.join(settings.MEDIA_ROOT, fileInfo.type) + '/' + fileInfo.filename)
        # delete the info. in DB
        fileInfo.delete()
        # delete data
        typestr = str(request.POST['type'])

        deleteObjs = None
        if typestr == 'electricity':
            deleteObjs = ElectricityInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = int(request.POST['bid']))
        elif typestr == 'gas':
            deleteObjs = GasInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = int(request.POST['bid']))
        elif typestr == 'water':
            deleteObjs = WaterInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = int(request.POST['bid']))
        # notice data update
        em = EachMonthInfo.objects.filter(building = int(request.POST['bid']), year = int(request.POST['year']), month = int(request.POST['month']))
        for obj in deleteObjs:
            for elem in em:
                if int(elem.resident.id) == int(obj.resident.id):
                    if typestr == 'electricity':
                        elem.totalFee -= int(elem.electricityFee)
                        elem.electricityFee = 0
                    elif typestr == 'gas':
                        elem.totalFee -= int(elem.gasFee)
                        elem.gasFee = 0
                    else:
                        elem.totalFee -= int(elem.waterFee)
                        elem.waterFee = 0
                    elem.save()
                    break
        deleteObjs.delete()

        return HttpResponse('file delete - SUCCESS')
    return HttpResponse('file delete - NOT POST')

def check_input_html(request):
    return render(request, '03_02_check_input.html', setPostData(request))

def notice_input_html(request):
    return render(request, '03_02_notice_input.html', setPostData(request))

def notice_detail_save(request):
    if request.method == 'POST':
        em = EachMonthInfo.objects.get(id = int(request.POST['em_id']))
        data = EachMonthDetailInfo()
        data.eachMonth = em
        data.year = int(em.year)
        data.month = int(em.month)
        data.modifyNumber = int(request.POST['modifyNumber'])
        data.leaseMoney = int(request.POST['leaseMoney'])
        data.maintenanceFee = int(request.POST['maintenanceFee'])
        data.surtax = int(request.POST['surtax'])
        data.parkingFee = int(request.POST['parkingFee'])
        data.electricityFee = int(request.POST['electricityFee'])
        data.gasFee = int(request.POST['gasFee'])
        data.waterFee = int(request.POST['waterFee'])
        data.totalFee = int(request.POST['totalFee'])
        data.etcFee = int(request.POST['etcFee'])
        data.changedFee = int(request.POST['changeFee'])
        data.msg = str(request.POST['msg'])
        data.changeDate = str(request.POST['modifyDate']).replace('.', '-')
        data.save()

        # update eachmonth
        em.leaseMoney = data.leaseMoney
        em.maintenanceFee = data.maintenanceFee
        em.surtax = data.surtax
        em.parkingFee = data.parkingFee
        em.electricityFee = data.electricityFee
        em.gasFee = data.gasFee
        em.waterFee = data.waterFee
        em.totalFee = data.totalFee
        em.etcFee = data.etcFee
        em.changedFee = data.changedFee
        em.save()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')


def serialize_notice_input_detail(notice):
    serialized = []
    for n in notice:
        data = {}
        data['id'] = int(n.id)
        data['year'] = int(n.year)
        data['month'] = int(n.month)
        data['noticeNumber'] = int(n.noticeNumber)
        data['leaseMoney'] = int(n.leaseMoney)
        data['maintenanceFee'] = int(n.maintenanceFee)
        data['surtax'] = int(n.surtax)
        data['parkingFee'] = int(n.parkingFee)
        data['electricityFee'] = int(n.electricityFee)
        data['gasFee'] = int(n.gasFee)
        data['waterFee'] = int(n.waterFee)
        data['etcFee'] = int(n.etcFee)
        data['totalFee'] = int(n.totalFee)
        data['changedFee'] = ''
        if n.changedFee != None:
            data['changedFee'] = int(n.changedFee)
        data['noticeDate'] = ''
        if n.noticeDate != None:
            #data['noticeDate'] = str(n.noticeDate.month)+'.'+str(n.noticeDate.day)
            data['noticeDate'] = '.'.join(str(n.noticeDate).split('.')[1:])
        serialized.append(data)
    return serialized


def serialize_detail_tab2(data):
    serialized = []
    for d in data:
        p = {}
        p['id'] = int(d.id)
        p['noticeNumber'] = d.noticeNumber
        p['year'] = d.year
        p['month'] = d.month
        p['leaseMoney'] = d.leaseMoney
        p['maintenanceFee'] = d.maintenanceFee
        p['surtax'] = d.surtax
        p['parkingFee'] = d.parkingFee
        p['electricityFee'] = d.electricityFee
        p['gasFee'] = d.gasFee
        p['waterFee'] = d.waterFee
        #p[''] = d.
        #p[''] = d.
        #p[''] = d.
        p['etcFee'] = d.etcFee
        if d.changedFee == None:
            p['changedFee'] = int(0)
        else:
            p['changedFee'] = int(d.changedFee)
        p['totalFee'] = d.totalFee
        p['noticeDate'] = ''
        if d.noticeDate != None:
            p['noticeDate'] = str(d.noticeDate.month)+'.'+str(d.noticeDate.day)
        serialized.append(p)
    return serialized

def notice_detail_tab2(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        data = EachMonthInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
        return toJSON(serialize_detail_tab2(data))
    return HttpResponse('NOT POST')


def serialize_detail_tab2_detail(data):
    serialized = []
    for d in data:
        p = {}
        p['id'] = int(d.id)
        p['eid'] = int(d.eachMonth_id)
        p['modifyNumber'] = d.modifyNumber
        p['leaseMoney'] = d.leaseMoney
        p['maintenanceFee'] = d.maintenanceFee
        p['surtax'] = d.surtax
        p['parkingFee'] = d.parkingFee
        p['electricityFee'] = d.electricityFee
        p['gasFee'] = d.gasFee
        p['waterFee'] = d.waterFee
        #p[''] = d.
        #p[''] = d.
        #p[''] = d.
        p['etcFee'] = d.etcFee
        p['changedFee'] = d.changedFee
        p['totalFee'] = d.totalFee
        p['inputDate'] = d.inputDate
        p['noticeDate'] = d.noticeDate
        p['status'] = int(0)
        if d.inputDate != '' and d.noticeDate != '':
            p['status'] = int(1)
        serialized.append(p)
    return serialized

def notice_detail_tab2_detail(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        em = EachMonthInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
        em_id = []
        for n in em:
            em_id.append(int(n.id))
            if n.changedFee != None:
                n.changedFee = int(n.changedFee)

        emd = EachMonthDetailInfo.objects.filter(eachMonth_id__in = em_id).order_by('-id')
        for e in emd:
            e.inputDate = ''
            e.noticeDate = ''
            for i in em:
                if int(i.id) == int(e.eachMonth_id):
                    if i.inputDate != None:
                        e.inputDate = str(i.inputDate.year)+'.'+str(i.inputDate.month)+'.'+str(i.inputDate.day)
                    if i.noticeDate != None:
                        e.noticeDate = str(i.noticeDate.year)+'.'+str(i.noticeDate.month)+'.'+str(i.noticeDate.day)
                    break

        return toJSON(serialize_detail_tab2_detail(emd))
    return HttpResponse('NOT POST')

def notice_detail_input_html(request, bid, rid, eid, tab):
    param = {}
    param['tab'] = int(tab)
    res = ResidentInfo.objects.get(id = int(rid))
    res.inDate = str(res.inDate.year)+'.'+str(res.inDate.month)+'.'+str(res.inDate.day)
    res.outDate = str(res.outDate.year)+'.'+str(res.outDate.month)+'.'+str(res.outDate.day)
    param['resident'] = res
    param['simpleLeaseDeposit'] = int(param['resident'].leaseDeposit) / int(10000)
    param['simpleLeaseMoney'] = int(param['resident'].leaseMoney) / int(10000)
    param['building_name'] = BuildingInfo.objects.get(id = int(bid)).name
    param['building_id'] = int(bid)

    ### for tab2 ###
    param['eachMonth'] = EachMonthInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
    for n in param['eachMonth']:
        if n.changedFee != None:
            n.changedFee = int(n.changedFee)
        if n.noticeDate != None:
            n.noticeDate = str(n.noticeDate.month)+'.'+str(n.noticeDate.day)
        else:
            n.noticeDate = ''
    ################

    original = EachMonthInfo.objects.get(id = int(eid))
    param['yymm'] = str(original.year)+'.'+str(original.month)
    param['noticeNumber'] = int(original.noticeNumber)
    param['list'] = EachMonthDetailInfo.objects.filter(eachMonth = int(eid)).order_by('-id')
    for l in param['list']:
        if l.changeDate != None:
            l.changeDate = str(l.changeDate.year)+'.'+str(l.changeDate.month)+'.'+str(l.changeDate.day)
        else:
            l.changeDate = ''
        l.inputDate = ''
        l.noticeDate = ''
        if original.inputDate != None:
            l.inputDate = str(original.inputDate.year)+'.'+str(original.inputDate.month)+'.'+str(original.inputDate.day)
        if original.noticeDate != None:
            l.noticeDate = str(original.noticeDate.year)+'.'+str(original.noticeDate.month)+'.'+str(original.noticeDate.day)
        l.status = int(0)
        if l.inputDate != None and l.noticeDate != None:
            l.status = int(1)
    
    param['list_length'] = len(param['list'])
    param['maxModifyNumber'] = int(param['list'][0].modifyNumber)

    param['list_last'] = param['list'][0]
    param['list_last'].nextModifyNumber = int(param['list_last'].modifyNumber) + 1

    return render(request, '03_02_notice_detail_input.html', param)

def save_input(request):
    if request.method == 'POST':
        data = EachMonthInfo.objects.get(id = int(request.POST['eid']))
        if str(request.POST['inputCheck']) == '0':
            data.inputCheck = False
            data.inputDate = None
        else:
            data.inputCheck = True
            data.inputDate = str(request.POST['inputDate']).replace('.', '-')
        data.save()
        return HttpResponse('OK')
    return HttpResponse('NOT POST')

def save_notice(request):
    if request.method == 'POST':
        data = EachMonthInfo.objects.get(id = int(request.POST['eid']))
        if str(request.POST['noticeCheck']) == '0':
            data.noticeCheck = False
            data.noticeDate = None
            pay = PaymentInfo.objects.filter(building = data.building, resident = data.resident, year = int(data.year), month = int(data.month))
            for p in pay:
                p.noticeCheck = False
                p.save()
        else:
            data.noticeCheck = True
            data.noticeDate = str(request.POST['noticeDate']).replace('.', '-')
            temp = PaymentInfo.objects.filter(building = data.building, resident = data.resident, year = int(data.year), month = int(data.month))
            for t in temp:
                t.noticeCheck = True
                t.save()
            print(len(temp))
            if len(temp) == 0:
                info = PaymentInfo.objects.filter(building = data.building, resident = data.resident).order_by('-id')
                # make new 'payment object
                pay = PaymentInfo()
                pay.noticeCheck = True
                pay.checked = False
                pay.resident = data.resident
                pay.building = data.building
                pay.year = int(data.year)
                pay.month = int(data.month)
                pay.number = len(info) + 1
                pay.amountPaySum = 0
                pay.amountPay = 0
                pay.amountNoPay = int(data.totalFee)
                if pay.number > 1 :
                    pay.amountNoPay += int(info[0].amountNoPay)
                pay.totalFee = pay.amountNoPay
                pay.confirmStatus = '0'
                pay.payStatus = 0
                if pay.number == 1:
                    pay.delayNumberNow = 1
                else:
                    if info[0].payStatus == -1:
                        pay.delayNumberNow = info[0].delayNumberNow
                    else:
                        pay.delayNumberNow = info[0].delayNumberNow + 1
                pay.delayNumberNext = pay.delayNumberNow + 1
                pay.modifyNumber = 0
                pay.save()

                # insert new modify info
                import datetime
                elem = PaymentModifyInfo()
                elem.payment = PaymentInfo.objects.get(id = int(pay.id))
                elem.modifyNumber = int(0)
                elem.year = pay.year
                elem.month = pay.month
                elem.payStatus = pay.payStatus
                elem.delayNumberNow = pay.delayNumberNow
                elem.delayNumberNext = pay.delayNumberNext
                elem.amountPaySum = pay.amountPaySum
                elem.amountPay = pay.amountPay
                elem.amountNoPay = pay.amountNoPay
                elem.modifyMsg = ''
                elem.save()

        data.save()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')



def electricity_input_html(request):
    return render(request, '03_02_electricity_input.html', setPostData(request, "electricity"))

def gas_input_html(request):
    return render(request, '03_02_gas_input.html', setPostData(request, "gas"))

def water_input_html(request):
    '''
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
    # get excel file
    # ...
    return render(request, '03_02_water_input.html', {'building_name_id' : building_name_id})
    '''
    return render(request, '03_02_water_input.html', setPostData(request, "water"))


##### 03_03 : payment #####

def payment_input_html(request):

    return render(request, '03_03_payment.html', setPostData(request, 'payment'))

## prettify data for payment
def serialize_payment(result):
    serialized = []
    for i in range(len(result)):
        if i > 0 and int(result[i].resident.id) == int(result[i-1].resident.id):
            continue
        data = {}
        data['id'] = result[i].id
        data['noticeCheck'] = result[i].noticeCheck
        data['checked'] = result[i].checked
        data['roomnum'] = result[i].resident.buildingRoomNumber
        data['resident_id'] = result[i].resident.id
        data['name'] = result[i].resident.contractorName
        data['year'] = result[i].year
        data['month'] = result[i].month
        data['number'] = result[i].number
        data['totalFee'] = result[i].totalFee
        data['leasePayDate'] = result[i].resident.leasePayDate
        data['payStatus'] = result[i].payStatus
        data['amountPaySum'] = result[i].amountPaySum
        data['amountPay'] = result[i].amountPay
        data['amountNoPay'] = result[i].amountNoPay
        date = result[i].payDate
        if date == None:
            data['payDate'] = ''
        else:
            data['payDate'] = str(date.year)+'.'+str(date.month)+'.'+str(date.day)
        data['delayNumberNow'] = result[i].delayNumberNow
        data['delayNumberNext'] = result[i].delayNumberNext
        data['modifyNumber'] = result[i].modifyNumber
        serialized.append(data)

    # sort (by roomnum)
    temp = [ (d['roomnum'], d) for d in serialized ]
    temp2 = sorted(temp)
    serialized = [y for (x, y) in temp2]

    return serialized

def payment_input_getinfo(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
        data = PaymentInfo.objects.filter(building = bid, year = y, month = m).order_by('resident', '-id')
        return toJSON(serialize_payment(data))
    return HttpResponse('NOT POST')

def payment_check(request):
    if request.method == 'POST':
        data = PaymentInfo.objects.get(id = int(request.POST['pid']))
        if str(request.POST['inputCheck']) == '0':
            data.checked = False
        else:
            data.checked = True
        data.save()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')





def payment_detail_html(request, bid, rid, tab):
    param = {}
    param['tab'] = int(tab)
    param['bid'] = int(bid)
    param['rid'] = int(rid)

    param['resident'] = ResidentInfo.objects.get(id = int(rid))
    param['resident'].bName = BuildingInfo.objects.get(id = int(bid)).name
    inn = param['resident'].inDate
    out = param['resident'].outDate
    param['resident'].inDate = str(inn.year)+'.'+str(inn.month)+'.'+str(inn.day)
    param['resident'].outDate = str(out.year)+'.'+str(out.month)+'.'+str(out.day)
    param['simpleLeaseDeposit'] = int(param['resident'].leaseDeposit) / int(10000)
    param['simpleLeaseMoney'] = int(param['resident'].leaseMoney) / int(10000)

    # payment history list
    param['list'] = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
    no = len(param['list'])
    for p in param['list']:
        if p.payDate == None:
            p.payDate = ''
        else:
            p.payDate = str(p.payDate.year)+'.'+str(p.payDate.month)+'.'+str(p.payDate.day)
        if p.confirmDate == None:
            p.confirmDate = ''
        else:
            p.confirmDate = str(p.confirmDate.year)+'.'+str(p.confirmDate.month)+'.'+str(p.confirmDate.day)
        p.no = no
        no -= 1
    param['list_last'] = param['list'][0]
    param['list_delay'] = range(max(0, int(param['list_last'].delayNumberNow)-3), int(param['list_last'].delayNumberNow)+3+1)

    # modify history list (only for the last payment)
    param['modify_list'] = PaymentModifyInfo.objects.filter(payment = int(param['list'][0].id))
    for p in param['modify_list']:
        if p.payDate == None:
            p.payDate = ''
        else:
            p.payDate = str(p.payDate.year)+'.'+str(p.payDate.month)+'.'+str(p.payDate.day)
        if p.confirmDate == None:
            p.confirmDate = ''
        else:
            p.confirmDate = str(p.confirmDate.year)+'.'+str(p.confirmDate.month)+'.'+str(p.confirmDate.day)
    param['modify_list_last'] = param['modify_list'][len(param['modify_list'])-1]
    param['modify_list_delay'] = range(max(0, int(param['modify_list_last'].delayNumberNow)-3), int(param['modify_list_last'].delayNumberNow)+3+1)
    param['modify_max_num'] = int(param['modify_list_last'].modifyNumber) + 1

    # modify messages
    param['modify_msg'] = []
    for i in range(1, len(param['modify_list'])):
        d = {}
        d['no'] = i
        d['year'] = param['modify_list'][i].year
        d['month'] = param['modify_list'][i].month
        d['modifyNumber'] = param['modify_list'][i].modifyNumber
        d['modifyMsg'] = param['modify_list'][i].modifyMsg
        time = param['modify_list'][i].modifyTime
        d['modifyTime'] = str(time.year)+'.'+str(time.month)+'.'+str(time.day)
        param['modify_msg'].append(d)

    return render(request, '03_03_payment_detail.html', param)


# serialize data for payment detail all info
def serialize_paymentDetailAllInfo(result):
    serialized = []
    for i in range(len(result)):
        data = {}
        data['id'] = result[i].id
        data['checked'] = result[i].checked
        data['year'] = result[i].year
        data['month'] = result[i].month
        data['number'] = result[i].number
        data['totalFee'] = result[i].totalFee
        data['leasePayDate'] = result[i].resident.leasePayDate
        data['payDate'] = ''
        if result[i].payDate != None:
            data['payDate'] = str(result[i].payDate.year)+'.'+str(result[i].payDate.month)+'.'+str(result[i].payDate.day)
        data['amountPay'] = result[i].amountPay
        data['amountNoPay'] = result[i].amountNoPay
        data['confirmDate'] = ''
        if result[i].confirmDate != None:
            data['confirmDate'] = str(result[i].confirmDate.year)+'.'+str(result[i].confirmDate.month)+'.'+str(result[i].confirmDate.day)
        data['delayNumberNow'] = result[i].delayNumberNow
        data['payStatus'] = result[i].payStatus
        data['modifyNumber'] = result[i].modifyNumber
        serialized.append(data)
    return serialized
def payment_detail_allInfo(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        data = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
        return toJSON(serialize_paymentDetailAllInfo(data))
    return HttpResponse('NOT POST')

# serialize data for payment modify info
def serialize_paymentModifyInfo(result):
    serialized = []
    for i in range(len(result)):
        if int(result[i].modifyNumber) == 0:
            continue
        data = {}
        data['pid'] = result[i].payment.id
        data['no'] = len(result) - i
        data['year'] = result[i].year
        data['month'] = result[i].month
        data['modifyNumber'] = result[i].modifyNumber
        data['modifyMsg'] = result[i].modifyMsg
        time = result[i].modifyTime
        data['modifyTime'] = str(time.year)+'.'+str(time.month)+'.'+str(time.day)
        serialized.append(data)
    return serialized

def payment_detail_modifyinfo(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        paymentIds = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id').values('id')
        data = PaymentModifyInfo.objects.filter(payment__in = paymentIds).order_by('-id')
        return toJSON(serialize_paymentModifyInfo(data))
    return HttpResponse('NOT POST')



def payment_detail_saveInput(request):
    if request.method == 'POST':
        #insert inputted payment info
        elem = PaymentInfo()
        elem.building = BuildingInfo.objects.get(id = int(request.POST['building_id']))
        elem.resident = ResidentInfo.objects.get(id = int(request.POST['resident_id']))
        elem.noticeCheck = request.POST['noticeCheck']
        elem.year = int(request.POST['year'])
        elem.month = int(request.POST['month'])
        elem.number = int(request.POST['number'])
        elem.totalFee = int(request.POST['totalFee'])
        elem.amountPaySum = int(request.POST['amountPaySum'])
        elem.amountPay = int(request.POST['amountPay'])
        elem.amountNoPay = int(request.POST['amountNoPay'])
        if elem.amountPaySum == elem.totalFee:
            elem.payStatus = int(-1)
        else:
            elem.payStatus = int(request.POST['payStatus'])
        elem.payDate = request.POST['payDate'].replace('.', '-')
        elem.confirmDate = request.POST['confirmDate'].replace('.', '-')
        elem.delayNumberNow = int(request.POST['delayNumberNow'])
        elem.delayNumberNext = int(request.POST['delayNumberNext'])
        elem.payMsg = str(request.POST['payMsg'])
        elem.modifyNumber = int(0)
        elem.confirmStatus = str(1)
        elem.checked = False
        elem.save()

        #make 0-th modified info
        m = PaymentModifyInfo()
        m.payment = PaymentInfo.objects.get(id = int(elem.id))
        m.modifyNumber = int(0)
        m.year = elem.year
        m.month = elem.month
        m.payStatus = elem.payStatus
        m.payDate = elem.payDate
        m.delayNumberNow = elem.delayNumberNow
        m.delayNumberNext = elem.delayNumberNext
        m.amountPaySum = elem.amountPaySum
        m.amountPay = elem.amountPay
        m.amountNoPay = elem.amountNoPay
        m.confirmDate = elem.confirmDate
        m.modifyMsg = ''
        m.modifyTime = None

        #save
        #elem.save()
        m.save()

        return HttpResponse('OK')
    return HttpResponse('NOT POST')


def payment_detail_saveModify(request):
    if request.method == 'POST':
        # insert new modify info
        import datetime
        elem = PaymentModifyInfo()
        elem.payment = PaymentInfo.objects.get(id = int(request.POST['payment_id']))
        elem.modifyNumber = int(request.POST['modifyNumber'])
        elem.year = int(request.POST['year'])
        elem.month = int(request.POST['month'])
        elem.payStatus = int(request.POST['payStatus'])
        elem.payDate = request.POST['payDate'].replace('.', '-')
        elem.delayNumberNow = int(request.POST['delayNumberNow'])
        elem.delayNumberNext = int(request.POST['delayNumberNext'])
        elem.amountPaySum = int(request.POST['amountPaySum'])
        elem.amountPay = int(request.POST['amountPay'])
        elem.amountNoPay = int(request.POST['amountNoPay'])
        elem.confirmDate = request.POST['confirmDate'].replace('.', '-')
        elem.modifyMsg = str(request.POST['modifyMsg'])
        d = datetime.datetime.now()
        elem.modifyTime = str(d.year)+'-'+str(d.month)+'-'+str(d.day)

        # update payment info by using the newly modified info
        pay = elem.payment
        pay.payStatus = elem.payStatus
        pay.payDate = elem.payDate
        pay.delayNumberNow = elem.delayNumberNow
        pay.delayNumberNext = elem.delayNumberNext
        pay.amountPaySum = elem.amountPaySum
        pay.amountPay = elem.amountPay
        pay.amountNoPay = elem.amountNoPay
        pay.confirmDate = elem.confirmDate
        pay.modifyNumber = elem.modifyNumber
        pay.confirmStatus = '2'

        #save
        elem.save()
        pay.save()
        
        return HttpResponse('OK')
    return HttpResponse('NOT POST')





