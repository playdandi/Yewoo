# -*- coding: utf-8 -*-

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from django.db.models import Q
import json
from buildingApp.models import *
from django.conf import settings
import os


def resident_info_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})

    return render(request, '02_01_resident_info.html', {'range' : range(1, 31+1), 'building_name_id' : building_name_id})

def building_get_rooms(request):
    if request.method == "POST":
        bid = int(request.POST.get('id'))
        rooms = BuildingFloor.objects.filter(building_id = bid)
        result = []
        for r in rooms:
            for n in range(1, r.roomNum+1):
                zero = ''
                if n < 10:
                    zero = '0'
                result.append(int(str(r.floor)+zero+str(n)))

        return toJSON(result)



def resident_show_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
    return render(request, '02_02_resident_show.html', {'building' : building_name_id})

def save_resident_info(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        resident = None
        if param['type'] == 'save':
            resident = ResidentInfo()
        else:
            resident = ResidentInfo.objects.get(id = int(param['uid']))

        resident.buildingName = int(param['buildingName'])
        resident.buildingRoomNumber = param['buildingRoomNumber']
        resident.maintenanceFee = int(param['maintenanceFee'])
        resident.surtax = int(param['surtax'])
        
        resident.residentName = str(param['residentName'])
        resident.leaseNumber = int(param['leaseNumber'])
        resident.leaseContractPeriod = int(param['leaseContractPeriod'])
        resident.leaseContractPeriodUnit = str(param['leaseContractPeriodUnit'])
        resident.inDate = param['inDate'].replace('.', '-')
        resident.outDate = param['outDate'].replace('.', '-')

        resident.leaseType = param['leaseType']
        resident.leaseDeposit = param['leaseDeposit']
        resident.leasePayWay = param['leasePayWay']
        resident.leasePayDate = param['leasePayDate']
        resident.leaseMoney = param['leaseMoney']

        resident.checkType = int(param['checkType'])
        resident.checkE = param['checkE']
        if int(param['checkType']) == 1:
            resident.checkHWG = param['checkHWG']
            resident.checkHG = param['checkHG']
            resident.checkHWW = param['checkHWW']
            resident.checkHW = param['checkHW']
            resident.checkG = None
            resident.checkW = None
        else:
            resident.checkHWG = None
            resident.checkHG = None
            resident.checkHWW = None
            resident.checkHW = None
            resident.checkG = param['checkG']
            resident.checkW = param['checkW']
        resident.readDate = param['readDate'].replace('.', '-')
        resident.readContent = param['readContent']

        resident.agency = param['agency']
        resident.agencyName = param['agencyName']

        resident.contractorName = param['contractorName']
        resident.contractorGender = param['contractorGender']
        resident.contractorRegNumber = param['contractorRegNumber']
        resident.contractorContactNumber1 = param['contractorContactNumber1']
        if param['contractorContactNumber2'] != '--':
            resident.contractorContactNumber2 = param['contractorContactNumber2']
        resident.contractorAddress = param['contractorAddress']

        resident.realResidentName = param['realResidentName']
        resident.residentGender = param['residentGender']
        resident.residentRegNumber = param['residentRegNumber']
        resident.relToContractor = param['relToContractor']
        resident.residentPeopleNumber = param['residentPeopleNumber']
        resident.residentAddress = param['residentAddress']
        resident.residentContactNumber1 = param['residentContactNumber1']
        if param['residentContactNumber2'] != '--':
            resident.residentContactNumber2 = param['residentContactNumber2']
        if param['residentOfficeName'] != '':
            resident.residentOfficeName = param['residentOfficeName']
        if param['residentOfficeLevel'] != '':
            resident.residentOfficeLevel = param['residentOfficeLevel']
        if param['residentOfficeAddress'] != '':
            resident.residentOfficeAddress = param['residentOfficeAddress']
        if param['residentOfficeContactNumber'] != '--':
            resident.residentOfficeContactNumber = param['residentOfficeContactNumber']
        resident.residentEmail = param['residentEmail']

        resident.haveCar = param['haveCar']
        if resident.haveCar == 'y':
            resident.carNumber = param['carNumber']
            resident.parkingFee = param['parkingFee']
        else:
            resident.carNumber = ''
            resident.parkingFee = int(0)
        resident.sendMsg = param['sendMsg']
        resident.itemCheckIn = param['itemCheckIn']
        resident.itemCheckOut = param['itemCheckOut']
        resident.memo = param['memo']
        
        resident.save()


        roominfo = RoomInfo.objects.get(building_id = int(resident.buildingName), roomnum = int(resident.buildingRoomNumber))
        if not roominfo.nowResident == resident:
            resident.leaseNumber = roominfo.residentnum + 1

        # uncheck before person
        if roominfo.nowResident != None:
            beforeResident = RoomInfo.objects.get(building = int(resident.buildingName), roomnum = int(resident.buildingRoomNumber)).nowResident
            beforeEM = None
            try:
                beforeEM = EachMonthInfo.objects.get(building = int(resident.buildingName), year = int(param['inDate'].split('.')[0]), month = int(param['inDate'].split('.')[1]), resident = beforeResident)
                beforeEM.isLiving = False
                beforeEM.save()
            except:
                pass
        
        # change roominfo (adjust new resident id to the room)
        if not roominfo.nowResident == resident:
            roominfo.nowResident = resident
            roominfo.isOccupied = True
            roominfo.residentnum = roominfo.residentnum + 1
            roominfo.save()

        # create EachMonthInfo only for this year/month.
        em = EachMonthInfo()
        em.building = BuildingInfo.objects.get(id = int(resident.buildingName))
        em.resident = resident
        resident.inDate = param['inDate'].replace('.', '-')
        em.year = int(param['inDate'].split('.')[0].strip())
        em.month = int(param['inDate'].split('.')[1].strip())
        em.noticeNumber = int(1)
        em.leaseMoney = resident.leaseMoney
        em.maintenanceFee = resident.maintenanceFee
        em.surtax = resident.surtax
        em.parkingFee = resident.parkingFee
        em.electricityFee = 0
        em.waterFee = 0
        em.gasFee = 0
        em.etcFee = 0
        em.totalFee = int(em.leaseMoney)+int(em.maintenanceFee)+int(em.surtax)+int(em.parkingFee)
        em.changedFee = 0
        em.inputCheck = False
        em.inputDate = None
        em.noticeCheck = False
        em.noticeDate = None
        em.isLiving = True
        em.save()
        # EachMonthDetailInfo (modifyNumber = 0)
        emd = EachMonthDetailInfo()
        emd.eachMonth = em
        emd.year = em.year
        emd.month = em.month
        emd.modifyNumber = int(0)
        emd.leaseMoney = em.leaseMoney
        emd.maintenanceFee = em.maintenanceFee
        emd.surtax = em.surtax
        emd.parkingFee = em.parkingFee
        emd.electricityFee = 0
        emd.gasFee = 0
        emd.waterFee = 0
        emd.totalFee = em.totalFee
        emd.etcFee = 0
        emd.changedFee = 0
        emd.msg = ''
        emd.changeDate = None
        emd.save()

    return render_to_response('index.html')


def show_resident_info(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        if int(param['type']) == 2:
            # show all residents
            result = ResidentInfo.objects.all()
            return toJSON(serialize(result))
        elif int(param['type']) == 0:
            # search
            word = param['keyword']
            # get building id 
            bInfo = BuildingInfo.objects.filter(name = word)
            bid = -1
            if len(bInfo) > 0:
                bid = bInfo[0].id

            result = []
            import re
            if re.sub('[0-9]+', '', word) == '':
                result = ResidentInfo.objects.filter(
                    Q(buildingName=bid) | Q(buildingRoomNumber=word) | Q(contractorName=word))
            else:
                result = ResidentInfo.objects.filter(
                    Q(buildingName=bid) | Q(contractorName=word))

            return toJSON(serialize(result))

        else:
            # search detail
            result = ResidentInfo.objects
            for p in param:
                if param[p] != '':
                    if p == 'buildingName':
                        result = result.filter(buildingName = int(param[p]))
                    elif p == 'buildingRoomNumber':
                        result = result.filter(buildingRoomNumber=param[p])
                    elif p == 'contractorName':
                        result = result.filter(contractorName = param[p])
                    elif p == 'contractorGender':
                        result = result.filter(contractorGender = param[p])
                    elif p == 'leaseDeposit':
                        result = result.filter(leaseDeposit = param[p])
                    elif p == 'leaseMoney':
                        result = result.filter(leaseMoney = param[p])
                    elif p == 'leaseType':
                        result = result.filter(leaseType = param[p])
                    elif p == 'inDate':
                        result = result.filter(inDate = param[p])
                    elif p == 'outDate':
                        result = result.filter(outDate = param[p])
                    elif p == 'isParking':
                        result = result.filter(haveCar = param[p])
            buildingAll = BuildingInfo.objects.all()
            for r in result:
                for b in buildingAll:
                    if b.id == r.buildingName:
                        r.buildingNameKor = b.name
                        break

            return toJSON(serialize(result))


    return render_to_response('index.html')
    

def show_detail_resident_info(request, uid):
    '''
    /resident/show/<id>\d
    '''
    result = ResidentInfo.objects.get(id = uid)

    # 표기법 달리할 것들 처리하기
    import re
    result.inDate = re.sub('[년월일\-]+', '.', str(result.inDate))
    result.outDate = re.sub('[년월일\-]+', '.', str(result.outDate))
    if result.itemCheckOut == 'y':
        if result.checkoutWhy == None:
            result.checkoutWhy = ''
        if result.checkoutDate == None:
            result.checkoutDate = ''
        result.checkoutDate = re.sub('[년월일\-]+', '.', str(result.checkoutDate))
    else:
        result.checkoutWhy = ''
        result.checkoutDate = ''
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

    return render(request, '02_02_resident_show_detail.html', {'result' : result, 'rooms' : rooms, 'building_name_id' : building_name_id, 'uid' : uid, 'range' : range(1, 32)})


def serialize(result):
    serialized = []
    buildingAll = BuildingInfo.objects.all()
    for res in result:
        data = {}
        data['id'] = res.id
        data['buildingName'] = res.buildingName
        for b in buildingAll:
            if b.id == res.buildingName:
                data['buildingNameKor'] = b.name
                break
        data['buildingRoomNumber'] = res.buildingRoomNumber
        data['contractorName'] = res.contractorName
        data['contractorGender'] = res.contractorGender
        data['leaseType'] = res.leaseType
        data['leaseDeposit'] = res.leaseDeposit
        data['leaseMoney'] = res.leaseMoney
        data['inDate'] = res.inDate.isoformat().replace('-', '.')
        data['outDate'] = res.outDate.isoformat().replace('-', '.')
        serialized.append(data)
    return serialized


def toJSON(objs, status=200):
    j = json.dumps(objs, ensure_ascii=False)
    return HttpResponse(j, status=status, content_type='application/json; charset=utf-8')
