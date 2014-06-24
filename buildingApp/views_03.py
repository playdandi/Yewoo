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

def lease_show_html(request):
    return render(request, '03_01_lease_show.html', setPostData(request))


def serialize_allInfo(lease, notice, payment, leasePayDate):
    serialized_lease = []
    serialized_notice = []
    serialized_payment = []
    for r in lease: # 임대 상세 탭의 정보
        data = {}
        data['leaseNumber'] = r.leaseNumber
        data['leasePeriod'] = str(r.leaseContractPeriod)
        data['inDate'] = prettyDate(r.inDate)
        data['outDate'] = prettyDate(r.outDate)
        data['leaseType'] = r.leaseType
        data['leaseDeposit'] = r.leaseDeposit
        data['leasePayWay'] = r.leasePayWay
        data['leaseMoney'] = r.leaseMoney
        data['maintenanceFee'] = r.maintenanceFee
        data['parkingFee'] = r.parkingFee
        data['surtax'] = r.surtax
        serialized_lease.append(data)
    for n in notice: # 고지 상세 탭의 정보
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
            data['noticeDate'] = '.'.join(str(n.noticeDate).split('.')[1:])
        serialized_notice.append(data)
    for p in payment: # 납부 상세 탭의 정보
        data = {}
        data['id'] = int(p.id)
        data['year'] = int(p.year)
        data['month'] = int(p.month)
        data['checked'] = p.checked
        data['number'] = int(p.number)
        data['totalFee'] = int(p.totalFee)
        data['amountPaySum'] = int(p.amountPaySum)
        data['amountPay'] = int(p.amountPay)
        data['amountNoPay'] = int(p.amountNoPay)
        data['confirmStatus'] = int(p.confirmStatus)
        data['payStatus'] = int(p.payStatus)
        data['delayNumber'] = int(p.delayNumber)
        data['payMsg'] = str(p.payMsg)
        data['modifyNumber'] = int(p.modifyNumber)
        data['leasePayDate'] = int(leasePayDate)
        data['payDate'] = ''
        data['confirmDate'] = ''
        if p.payDate != None:
            data['payDate'] = str(p.payDate)
        if p.confirmDate != None:
            data['confirmDate'] = str(p.confirmDate)
        serialized_payment.append(data)

    return [serialized_lease, serialized_notice, serialized_payment]

### 03.01 : 임대/고지/납부 상세내역보기 데이터 (tab 1,2,3 정보 모두 들고온다)
def lease_notice_detail_getAllInfo(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        leasePayDate = ResidentInfo.objects.get(id = int(rid)).leasePayDate

        resident = ResidentInfo.objects.get(id = int(rid))
        roomNum = resident.buildingRoomNumber
        
        lease = ResidentInfo.objects.filter(buildingName = int(bid), buildingRoomNumber = roomNum)
        notice = []
        payment = []
        """
        notice = EachMonthInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
        payment = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
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
        """
    	return toJSON(serialize_allInfo(lease, notice, payment, leasePayDate))
    return HttpResponse('NOT POST')


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

### 03.01 : 최종고지내역 데이터 받는 부분 ###
def get_notice_info(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
        is_empty = request.POST['is_empty']
        #fromWhere = 0(03_01_notice), 1(03_02_check), 2(03_02_notice)
        fromWhere = int(request.POST['fromWhere'])
    	data = EachMonthInfo.objects.filter(year = y, month = m, building = bid).order_by('room', 'id')
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
                b_em = EachMonthInfo.objects.filter(building = bid, year = beforeYear, month = beforeMonth)
                for b in b_em:
                    em = EachMonthInfo()
                    em.building = b.building
                    em.resident = b.resident
                    em.room = b.room
                    em.year = y
                    em.month = m
                    if not b.isLiving:
                        em.noticeNumber = 0
                    else:
                        em.noticeNumber = int(b.noticeNumber)+1
                    em.leaseMoney = b.leaseMoney
                    em.maintenanceFee = b.maintenanceFee
                    em.surtax = b.surtax
                    em.parkingFee = b.parkingFee
                    em.electricityFee = 0
                    em.gasFee = 0
                    em.waterFee = 0
                    em.etcFee = 0
                    em.changedFee = 0
                    em.totalFee = int(em.leaseMoney)+int(em.maintenanceFee)+int(em.surtax)+int(em.parkingFee)
                    em.inputCheck = False
                    em.inputDate = None
                    em.noticeCheck = False
                    em.noticeDate = None
                    em.isLiving = b.isLiving
                    em.save()

                    emd = EachMonthDetailInfo()
                    emd.eachMonth = em
                    emd.year = em.year
                    emd.month = em.month
                    emd.modifyNumber = 0
                    emd.leaseMoney = em.leaseMoney
                    emd.maintenanceFee = em.maintenanceFee
                    emd.surtax = em.surtax
                    emd.parkingFee = em.parkingFee
                    emd.etcFee = 0
                    emd.electricityFee = 0
                    emd.gasFee = 0
                    emd.waterFee = 0
                    emd.totalFee = int(emd.leaseMoney)+int(emd.maintenanceFee)+int(emd.surtax)+int(emd.parkingFee)
                    emd.changedFee = 0
                    emd.save()
    	    data = EachMonthInfo.objects.filter(year = y, month = m, building = bid)
        if is_empty == 'false':
            rooms = RoomInfo.objects.filter(building_id = bid, isOccupied = True)
        else:
            rooms = RoomInfo.objects.filter(building_id = bid)

        return toJSON(serialize_notice(data, rooms, fromWhere, is_empty))
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

### prettify data for notice ###
### 사용하는 부분 : 03.01.최종고지내역, ... ###
def serialize_notice(result, rooms, fromWhere, is_empty):
    serialized = []
    #under = rooms.filter(roomnum__lt = 0).order_by('-roomnum') 
    #over = rooms.filter(roomnum__gt = 0).order_by('roomnum')
    #for chunk in (under,over):
    #    for room in chunk:
    #        if room.isOccupied:
    for res in result:
        #print('occupied : ', room.roomnum)
        #res = result.get(resident = room.nowResident)
        if (fromWhere == 0 and res.inputCheck and res.noticeCheck) or (fromWhere == 1) or (fromWhere == 2 and res.inputCheck):
            if (is_empty == 'false') and (not res.isLiving and res.resident == None):
                continue
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

            if res.resident != None:
                data['resident_id'] = res.resident.id
                data['buildingnum'] = res.resident.buildingName
                data['roomnum'] = res.resident.buildingRoomNumber
                data['name'] = res.resident.contractorName
            else:
                data['resident_id'] = None
                data['buildingnum'] = ''
                data['roomnum'] = ''
                data['name'] = ''
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
            
            # 이 거주자에 대한 납부내역 리스트(검색한 년/월 이전 것만)에서 완납되지 않은 달의 개수를 구한다.
            data['delayNumber'] = 0;
            data['accumNumber'] = 0;
            if data['resident_id'] != None:
                yy = int(res.year)
                mm = int(res.month)
                allPayments = PaymentInfo.objects.filter(building = int(data['buildingnum']), resident = int(data['resident_id']))
                allPayments = allPayments.filter( Q(year__lt = yy) | Q(year = yy, month__lte = mm) ).order_by('-number', '-id')
                cnt = int(0)
                for i in range(len(allPayments)):
                    if i > 0 and int(allPayments[i].number) == int(allPayments[i-1].number):
                        continue
                    if int(allPayments[i].payStatus) != -1 and int(allPayments[i].accumNumber) > 0:
                        cnt += 1
                data['delayNumber'] = cnt
                if len(allPayments) == 0: #아직 고지 체크를 하지 않은 경우 (즉, 납부 내역이 아직 만들어지지 않은 경우)
                    data['accumNumber'] = 0
                else:
                    data['accumNumber'] = allPayments[0].accumNumber

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
        """
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
        """
        deleteObjs.delete()

        return HttpResponse('file delete - SUCCESS')
    return HttpResponse('file delete - NOT POST')

def check_input_html(request):
    return render(request, '03_02_check_input.html', setPostData(request))

def notice_input_html(request):
    return render(request, '03_02_notice_input.html', setPostData(request))


### 03.02 고지 상세 입력 : tab1의 변동금액 저장할 때 호출됨 ###
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



def serialize_notice_detail_tab2Info(data, modifyData, bid, rid):
    serialized = []
    # 기본 리스트
    for d in data:
        p = {}
        p['type'] = 'basic'
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
        p['etcFee'] = d.etcFee
        p['changedFee'] = d.changedFee
        p['totalFee'] = d.totalFee
        p['inputDate'] = ''
        if d.inputDate != None:
            p['inputDate'] = str(d.inputDate.year)+'.'+str(d.inputDate.month)+'.'+str(d.inputDate.day)
        p['noticeDate'] = ''
        if d.noticeDate != None:
            p['noticeDate'] = str(d.noticeDate.year)+'.'+str(d.noticeDate.month)+'.'+str(d.noticeDate.day)
        # 이 거주자에 대한 납부내역 리스트(검색한 년/월 이전 것만)에서 완납되지 않은 달의 개수를 구한다.
        yy = int(p['year'])
        mm = int(p['month'])
        allPayments = PaymentInfo.objects.filter(building = int(bid), resident = int(rid))
        allPayments = allPayments.filter( Q(year__lt = yy) | Q(year = yy, month__lte = mm) ).order_by('-number', '-id')
        cnt = int(0)
        for i in range(len(allPayments)):
            if i > 0 and int(allPayments[i].number) == int(allPayments[i-1].number):
                continue
            if int(allPayments[i].payStatus) != -1 and int(allPayments[i].accumNumber) > 0:
                cnt += 1
        p['delayNumber'] = cnt
        p['accumNumber'] = allPayments[0].accumNumber
        serialized.append(p)
    # 변동 수정 리스트
    for d in modifyData:
        p = {}
        p['type'] = 'modify'
        p['id'] = int(d.id)
        p['eid'] = int(d.eachMonth_id)
        p['modifyNumber'] = d.modifyNumber
        p['year'] = d.year
        p['month'] = d.month
        p['leaseMoney'] = d.leaseMoney
        p['maintenanceFee'] = d.maintenanceFee
        p['surtax'] = d.surtax
        p['parkingFee'] = d.parkingFee
        p['electricityFee'] = d.electricityFee
        p['gasFee'] = d.gasFee
        p['waterFee'] = d.waterFee
        p['etcFee'] = d.etcFee
        p['changedFee'] = d.changedFee
        p['totalFee'] = d.totalFee
        #p['noticeDate'] = ''
        #if d.noticeDate != None:
        #    p['noticeDate'] = str(d.noticeDate.month)+'.'+str(d.noticeDate.day)
        serialized.append(p)
    return serialized

### 03.02 notice 상세 tab2 화면의 임대x회차 조회 버튼 클릭 시 동작함.
def notice_detail_tab2(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        roomNum = int(request.POST['roomNum'])
        lnt = int(request.POST['leaseNumberTotal'])
        noModify = int(request.POST['noModify'])

        # 임대 x회차였던 사람의 resident_id 를 구한다.
        try:
            rid = ResidentInfo.objects.get(buildingName = bid, buildingRoomNumber = roomNum, leaseNumberTotal = lnt).id
            # 있으면 Eachmonth 정보를 들고온다.
            EMs = EachMonthInfo.objects.filter(building_id = bid, resident_id = rid).order_by('-id')
            EMIDs = EMs.values('id')
            modifies = []
            if noModify == 0:
                modifies = EachMonthDetailInfo.objects.filter(eachMonth__in = EMIDs).order_by('eachMonth', '-modifyNumber')
            return toJSON(serialize_notice_detail_tab2Info(EMs, modifies, bid, rid))
        except Exception as e:
            print(e)
            # 없으면 empty list를 return
            return toJSON(serialize_notice_detail_tab2Info([], [], '', ''))
        return HttpResponse('?')
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

def notice_detail_input_html(request, bid, rid, eid, year, month, tab):
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
    param['year'] = int(year)
    param['month'] = int(month)
    param['leaseNumberTotal'] = int(param['resident'].leaseNumberTotal)
    param['leaseNumberList'] = range(1, param['leaseNumberTotal']+1)

    # 납부 내역 리스트를 가져온다.
    #PaymentInfo.objects.filter(building = int(bid), resident = int(rid), )

    # EachMonth의 수정 내역 리스트를 불러온다.
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
    
    ######## for tab2 ########
    param['eachMonth'] = EachMonthInfo.objects.filter(building_id = int(bid), resident_id = int(rid)).order_by('-id')
    for n in param['eachMonth']:
        if n.changedFee != None:
            n.changedFee = int(n.changedFee)
        if n.noticeDate != None:
            n.noticeDate = str(n.noticeDate.month)+'.'+str(n.noticeDate.day)
        else:
            n.noticeDate = ''
    ###########################

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

def pretty(y, m, d):
    mm = m
    if int(mm) < 10:
        mm = '0' + m
    dd = d
    if int(dd) < 10:
        dd = '0' + d
    return int(str(y)+str(mm)+str(dd))
    
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
            if len(temp) == 0:
                import datetime
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
                #if pay.number > 1 :
                #    pay.amountNoPay += int(info[0].amountNoPay)
                pay.totalFee = pay.amountNoPay
                pay.confirmStatus = '0'
                pay.delayFee = 0

                pay.accumNumber = 0
                d = datetime.datetime.now()
                if int(pretty(str(d.year), str(d.month), str(d.day))) > int(pretty(str(data.year), str(data.month), str(data.resident.leasePayDate))): 
                    pay.accumNumber = 1
                pay.payStatus = 0
                if pay.number == 1:
                    pay.delayNumber = 1
                else:
                    if info[0].payStatus == -1:
                        pay.delayNumber = info[0].delayNumber
                    else:
                        pay.delayNumber = info[0].delayNumber + 1
                pay.modifyNumber = 0
                pay.save()

                # insert new modify info
                elem = PaymentModifyInfo()
                elem.payment = PaymentInfo.objects.get(id = int(pay.id))
                elem.modifyNumber = int(0)
                elem.year = pay.year
                elem.month = pay.month
                elem.payStatus = pay.payStatus
                elem.delayNumber = pay.delayNumber
                elem.amountPaySum = pay.amountPaySum
                elem.amountPay = pay.amountPay
                elem.amountNoPay = pay.amountNoPay
                elem.accumNumber = pay.accumNumber
                elem.delayFee = int(0)
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
    return render(request, '03_02_water_input.html', setPostData(request, "water"))






########################################################
################### 03_03 : payment ####################
########################################################

def payment_input_html(request):
    return render(request, '03_03_payment.html', setPostData(request, 'payment'))

## prettify data for payment
def serialize_payment(result, bid, yy, mm):
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
        data['delayFee'] = result[i].delayFee
        data['delayNumber'] = result[i].delayNumber
        data['accumNumber'] = result[i].accumNumber
        data['modifyNumber'] = result[i].modifyNumber
        data['payDate'] = ''
        if result[i].payDate != None:
            data['payDate'] = str(result[i].payDate.year)+'.'+str(result[i].payDate.month)+'.'+str(result[i].payDate.day)
        
        # 이 거주자에 대한 납부내역 리스트(검색한 년/월 이전 것만)에서 완납되지 않은 달의 개수를 구한다.
        allPayments = PaymentInfo.objects.filter(building = int(bid), resident = int(data['resident_id']))
        allPayments = allPayments.filter( Q(year__lt = yy) | Q(year = yy, month__lte = mm) ).order_by('-number', '-id')
        cnt = int(0)
        for i in range(len(allPayments)):
            if i > 0 and int(allPayments[i].number) == int(allPayments[i-1].number):
                continue
            if int(allPayments[i].payStatus) != -1 and int(allPayments[i].accumNumber) > 0:
                cnt += 1
        data['delayNumber'] = cnt
        
        serialized.append(data)

    # sort (by roomnum)
    temp = [ (d['roomnum'], d) for d in serialized ]
    temp2 = sorted(temp)
    serialized = [y for (x, y) in temp2]

    return serialized

def payment_input_getinfo(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        data = PaymentInfo.objects.filter(building = bid, year = y, month = m).order_by('resident', '-id')
        return toJSON(serialize_payment(data, bid, y, m))
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



def payment_detail_html(request, bid, rid, year, month, tab):
    param = {}
    param['tab'] = int(tab)
    param['bid'] = int(bid)
    param['rid'] = int(rid)
    param['year'] = int(year)
    param['month'] = int(month)

    param['resident'] = ResidentInfo.objects.get(id = int(rid))
    param['resident'].bName = BuildingInfo.objects.get(id = int(bid)).name
    inn = param['resident'].inDate
    out = param['resident'].outDate
    param['resident'].inDate = str(inn.year)+'.'+str(inn.month)+'.'+str(inn.day)
    param['resident'].outDate = str(out.year)+'.'+str(out.month)+'.'+str(out.day)
    param['simpleLeaseDeposit'] = int(param['resident'].leaseDeposit) / int(10000)
    param['simpleLeaseMoney'] = int(param['resident'].leaseMoney) / int(10000)
    param['roomNum'] = int(param['resident'].buildingRoomNumber)
    param['leaseNumberTotal'] = int(param['resident'].leaseNumberTotal)
    param['leaseNumberList'] = range(1, param['leaseNumberTotal']+1)
    #original = EachMonthInfo.objects.get(id = int(eid))
    temp = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid), year = int(year), month = int(month))[0]
    param['noticeNumber'] = int(temp.number)
    return render(request, '03_03_payment_detail.html', param)


def serialize_payment_detail_allInfo(result, modify_result):
    serialized = []
    # serialize payment data
    for i in range(len(result)):
        data = {}
        data['type'] = 'basic'
        data['id'] = result[i].id
        data['checked'] = result[i].checked
        data['year'] = result[i].year
        data['month'] = result[i].month
        data['number'] = result[i].number
        data['totalFee'] = result[i].totalFee
        data['leasePayDate'] = result[i].resident.leasePayDate
        data['amountPaySum'] = result[i].amountPaySum
        data['amountPay'] = result[i].amountPay
        data['amountNoPay'] = result[i].amountNoPay
        data['delayFee'] = result[i].delayFee
        data['payStatus'] = result[i].payStatus
        data['confirmStatus'] = result[i].confirmStatus
        data['delayNumber'] = result[i].delayNumber
        data['modifyNumber'] = result[i].modifyNumber
        data['accumNumber'] = result[i].accumNumber
        data['payMsg'] = result[i].payMsg
        data['payDate'] = ''
        data['payDateDay'] = int(0)
        if result[i].payDate != None:
            data['payDate'] = str(result[i].payDate.year)+'.'+str(result[i].payDate.month)+'.'+str(result[i].payDate.day)
            data['payDateDay'] = int(result[i].payDate.day)
        data['confirmDate'] = ''
        if result[i].confirmDate != None:
            data['confirmDate'] = str(result[i].confirmDate.year)+'.'+str(result[i].confirmDate.month)+'.'+str(result[i].confirmDate.day)
        serialized.append(data)

    # serialize modify(payment detail) data
    for m in modify_result:
        data = {}
        data['type'] = 'modify'
        data['id'] = m.id
        data['payment_id'] = m.payment.id
        data['modifyNumber'] = m.modifyNumber
        data['accumNumber'] = m.accumNumber
        data['year'] = m.year
        data['month'] = m.month
        data['payStatus'] = m.payStatus
        data['delayNumber'] = m.delayNumber
        data['amountPaySum'] = m.amountPaySum
        data['amountPay'] = m.amountPay
        data['amountNoPay'] = m.amountNoPay
        data['delayFee'] = m.delayFee
        data['modifyTime'] = ''
        if m.modifyTime != None:
            data['modifyTime'] = str(m.modifyTime.year)+'.'+str(m.modifyTime.month)+'.'+str(m.modifyTime.day)
        data['modifyMsg'] = m.modifyMsg
        data['payDate'] = ''
        if m.payDate != None:
            data['payDate'] = str(m.payDate.year)+'.'+str(m.payDate.month)+'.'+str(m.payDate.day)
        data['confirmDate'] = ''
        if m.confirmDate != None:
            data['confirmDate'] = str(m.confirmDate.year)+'.'+str(m.confirmDate.month)+'.'+str(m.confirmDate.day)
        serialized.append(data)
    return serialized

def payment_detail_allInfo(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        rid = int(request.POST['resident_id'])
        yy = int(request.POST['year'])
        mm = int(request.POST['month'])
        
        # 검색한 년/월 까지만 뽑아낸다.
        allData = PaymentInfo.objects.filter(building_id = int(bid), resident_id = int(rid))
        allData = allData.filter( Q(year__lt = yy) | Q(year = yy, month__lte = mm) ).order_by('-number', '-id')

        # 위의 한 payment당 모든 modify정보를 뽑아낸다.
        paymentIDs = allData.values('id')
        modifyData = PaymentModifyInfo.objects.filter(payment__in = paymentIDs).order_by('payment', 'modifyNumber')

        return toJSON(serialize_payment_detail_allInfo(allData, modifyData))
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
        elem.delayFee = int(0)
        elem.payStatus = int(request.POST['payStatus'])
        elem.payDate = request.POST['payDate'].replace('.', '-')
        elem.confirmDate = request.POST['confirmDate'].replace('.', '-')
        elem.delayNumber = int(request.POST['delayNumber'])
        elem.accumNumber = int(request.POST['accumNumber'])
        elem.payMsg = str(request.POST['payMsg'])
        elem.modifyNumber = int(0)
        elem.confirmStatus = '1'
        elem.checked = False
        elem.save()

        #make 0-th modified info
        m = PaymentModifyInfo()
        #m.payment = PaymentInfo.objects.get(id = int(elem.id))
        m.payment = elem
        m.modifyNumber = int(0)
        m.year = elem.year
        m.month = elem.month
        m.payStatus = elem.payStatus
        m.payDate = elem.payDate
        m.delayNumber = elem.delayNumber
        m.accumNumber = elem.accumNumber
        m.amountPaySum = elem.amountPaySum
        m.amountPay = elem.amountPay
        m.amountNoPay = elem.amountNoPay
        m.delayFee = int(0)
        m.confirmDate = elem.confirmDate
        m.modifyMsg = ''
        m.modifyTime = None
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
        elem.accumNumber = int(request.POST['accumNumber'])
        elem.year = int(request.POST['year'])
        elem.month = int(request.POST['month'])
        elem.payStatus = int(request.POST['payStatus'])
        elem.payDate = request.POST['payDate'].replace('.', '-')
        elem.delayNumber = int(request.POST['delayNumber'])
        elem.delayFee = int(request.POST['delayFee'])
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
        pay.amountPaySum = elem.amountPaySum
        pay.amountPay = elem.amountPay
        pay.amountNoPay = elem.amountNoPay
        pay.confirmDate = elem.confirmDate
        pay.modifyNumber = elem.modifyNumber
        pay.delayFee = elem.delayFee
        pay.confirmStatus = '2'

        #save
        elem.save()
        pay.save()
        
        return HttpResponse('OK')
    return HttpResponse('NOT POST')

######### 03.03 payment detail (tab2) ##############
def payment_detail_info_tab2(request):
    if request.method == 'POST':
        bid = int(request.POST['building_id'])
        roomNum = int(request.POST['roomNum'])
        lnt = int(request.POST['leaseNumberTotal'])
        noModify = int(request.POST['noModify'])

        # 임대 x회차였던 사람의 resident_id 를 구한다.
        try:
            rid = ResidentInfo.objects.get(buildingName = bid, buildingRoomNumber = roomNum, leaseNumberTotal = lnt).id
            # 있으면 payment, paymentModify 정보 들고간다.
            payments = PaymentInfo.objects.filter(building_id = bid, resident_id = rid).order_by('-number', '-id')
            paymentIDs = payments.values('id')
            modifies = []
            if noModify == 0:
                modifies = PaymentModifyInfo.objects.filter(payment__in = paymentIDs).order_by('payment', 'modifyNumber')
            return toJSON(serialize_payment_detail_allInfo(payments, modifies))
        except:
            # 없으면 empty list를 return
            return toJSON(serialize_payment_detail_allInfo([], []))
        return HttpResponse('?')
    return HttpResponse('NOT POST')
