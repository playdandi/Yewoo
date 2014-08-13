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
from django.contrib.auth.decorators import permission_required


### 02.01 ###
@permission_required('buildingApp.resident_info', login_url='/login/')
def resident_info_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})

    return render(request, '02_01_resident_info.html', {'range' : range(1, 31+1), 'building_name_id' : building_name_id})

### 02.03 ###
@permission_required('buildingApp.resident_infofile', login_url='/login/')
def resident_infoFile_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})

    return render(request, '02_03_resident_infoFile.html', {'range' : range(1, 31+1), 'building_name_id' : building_name_id})


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


@permission_required('buildingApp.resident_show', login_url='/login/')
def resident_show_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
    return render(request, '02_02_resident_show.html', {'building_name_id' : building_name_id, 'numOfBuilding' : len(building_name_id)})


### 02.03 : 저장하기 버튼 누른 경우 ###
@permission_required('buildingApp.resident_infofile', login_url='/login/')
def save_resident_info_by_file(request):
    if request.method == 'POST':
        length = int(request.POST['length'])
        for l in range(length):
            param = {}
            for name in request.POST:
                if name.startswith(str(l)+'_'):
                    n = name.replace(str(l)+'_', '')
                    param[n] = request.POST.get(name, '').strip()
            save_resident_info(request, param)
        return HttpResponse('OK')
    return HttpResponse('NOT POST')

@permission_required('buildingApp.resident_info', login_url='/login/')
def save_resident_info(request, data = None):
    if request.method == "POST":
        param = {}
        if data == None:
            for name in request.POST:
                param[name] = request.POST.get(name, '').strip()
        else:
            param = data

        resident = None
        if param['type'] == 'save':
            resident = ResidentInfo()
        else:
            resident = ResidentInfo.objects.get(id = int(param['uid']))

        # 있는 호실인지 검사
        ri = RoomInfo.objects.get(building_id = int(param['buildingName']), roomnum = int(param['buildingRoomNumber']))

        resident.buildingName = int(param['buildingName'])
        resident.manager = str(param['manager'])
        resident.buildingRoomNumber = param['buildingRoomNumber']
        resident.maintenanceFee = int(param['maintenanceFee'])
        resident.surtax = int(param['surtax'])
        
        resident.residentName = str(param['residentName'])
        total = ResidentInfo.objects.filter(buildingName = int(param['buildingName']), buildingRoomNumber = int(param['buildingRoomNumber']))
        resident.leaseNumberTotal = len(total) + 1
        resident.leaseNumber = int(param['leaseNumber'])
        resident.leaseContractPeriod = int(param['leaseContractPeriod'])
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

        resident.checkIn = param['checkIn']
        resident.realInDate = param['realInDate'].replace('.', '-')
        resident.checkOut = param['checkOut']
        resident.realOutDate = param['realOutDate'].replace('.', '-')
        if resident.realOutDate == '':
            resident.realOutDate = None
        resident.outReason = param['outReason']

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
                try:
                    beforeEM = EachMonthInfo.objects.get(building = int(resident.buildingName), year = int(param['inDate'].split('.')[0]), month = int(param['inDate'].split('.')[1]), resident = roominfo.nowResident)
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
        import datetime
        ymd = datetime.datetime.now()
        if param['type'] == 'save':
            em = EachMonthInfo()
            em.building = BuildingInfo.objects.get(id = int(resident.buildingName))
            em.resident = resident
            em.room = roominfo
            #em.year = int(param['inDate'].split('.')[0].strip())
            #em.month = int(param['inDate'].split('.')[1].strip())
            em.year = int(ymd.year)
            em.month = int(ymd.month)
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
        else:
            em = EachMonthInfo.objects.filter(building_id = int(resident.buildingName), resident_id = int(resident.id)).order_by('-id')[0]
            em.totalFee -= (int(em.leaseMoney) + int(em.maintenanceFee) + int(em.surtax) + int(em.parkingFee))
            em.totalFee += (int(resident.leaseMoney) + int(resident.maintenanceFee) + int(resident.surtax) + int(resident.parkingFee))
            em.leaseMoney = resident.leaseMoney
            em.maintenanceFee = resident.maintenanceFee
            em.surtax = resident.surtax
            em.parkingFee = resident.parkingFee
            em.save()

    return render_to_response('index.html')


@permission_required('buildingApp.resident_show', login_url='/login/')
def show_resident_info(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        result = []
        if int(param['type']) == 0: # 일반 검색
            # search
            word = str(param['keyword'])
            bid = ''
            if param['bid'] != '':
                bid = int(param['bid'])
            # get building id 
            #bInfo = BuildingInfo.objects.filter(name = word)
            #bid = -1
            #if len(bInfo) > 0:
            #    bid = bInfo[0].id
            
            import re
            if bid == '': # 모든 건물
                if word == '': # 키워드 x
                    result = ResidentInfo.objects.all()
                else:
                    if re.sub('[0-9]+', '', word) == '': # 숫자만 있는 경우
                        result = ResidentInfo.objects.filter(Q(buildingRoomNumber=word) | Q(residentName=word))
                    else:
                        result = ResidentInfo.objects.filter(Q(residentName=word))
            else: # 특정 건물 1개
                result = ResidentInfo.objects.filter(buildingName = bid)
                if word == '': # 키워드 x
                    pass
                else:
                    if re.sub('[0-9]+', '', word) == '': # 숫자만 있는 경우
                        result = result.filter(Q(buildingRoomNumber=word) | Q(residentName=word))
                    else:
                        result = result.filter(Q(residentName=word))
            
        else: # 상세 검색
            result = ResidentInfo.objects
            for p in param:
                if param[p] != '':
                    if p == 'buildingName':
                        result = result.filter(buildingName = int(param[p]))
                    elif p == 'buildingRoomNumber':
                        result = result.filter(buildingRoomNumber=param[p])
                    elif p == 'residentName':
                        result = result.filter(residentName = param[p])
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

        # return result
        buildingAll = BuildingInfo.objects.all()
        for r in result:
            for b in buildingAll:
                if b.id == r.buildingName:
                    r.buildingNameKor = b.name
                    break
        return toJSON(serialize(result))

    return render_to_response('index.html')
    

### 02.02 : 입주자 목록에서 '수정'버튼 누른 경우
@permission_required('buildingApp.resident_show', login_url='/login/')
def show_modify_resident_info(request, rid):
    '''
    /resident/modify/<rid>\d
    '''
    result = ResidentInfo.objects.get(id = rid)

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

    return render(request, '02_02_resident_modify.html', {'result' : result, 'rooms' : rooms, 'building_name_id' : building_name_id, 'uid' : rid, 'range' : range(1, 32)})


### 02.02 : 입주자 목록에서 '보기'버튼 누른 경우
@permission_required('buildingApp.resident_show', login_url='/login/')
def show_detail_resident_info(request, uid):
    '''
    /resident/show/<id>\d
    '''
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

    return render(request, '02_02_resident_show_detail.html', {'result' : result, 'rooms' : rooms, 'building_name_id' : building_name_id, 'uid' : uid, 'range' : range(1, 32)})


### 02.03 : 엑셀 파일 불러올 때 실행되는 함수
@permission_required('buildingApp.resident_infofile', login_url='/login/')
def get_all_residentInfo_bname_roomnum(request):
    if request.method == 'POST':
        result = []
        buildingAll = BuildingInfo.objects.all()
        residentAll = ResidentInfo.objects.all()

        usedBuildingName = []

        # 현 입주자들의 건물명/건물id/호실/입주자id를 얻는다.
        for r in residentAll:
            for b in buildingAll:
                if int(b.id) == int(r.buildingName):
                    p = {}
                    p['buildingName'] = str(b.name).strip()
                    p['bid'] = int(b.id)
                    p['roomNumber'] = int(r.buildingRoomNumber)
                    p['rid'] = int(r.id)
                    result.append(p)
                    usedBuildingName.append(int(b.id))
                    break
        
        # DB의 입주자들과 매치되는 건물이 없을 때
        for b in buildingAll:
            flag = False
            for b_id in usedBuildingName:
                if b_id == int(b.id):
                    flag = True
                    break
            if not flag:
                p = {}
                p['buildingName'] = str(b.name).strip()
                p['bid'] = int(b.id)
                p['roomNumber'] = int(-1)
                p['rid'] = int(-1)
                result.append(p)
        
        return toJSON(result)
    return 'HTTP - NOT POST'


def serialize(result):
    serialized = []
    buildingAll = BuildingInfo.objects.all()
    for res in result:
        if int(res.id) == 0: # fake resident info
            continue
        data = {}
        data['id'] = res.id
        data['buildingName'] = res.buildingName
        for b in buildingAll:
            if b.id == res.buildingName:
                data['buildingNameKor'] = b.name
                break
        data['buildingRoomNumber'] = res.buildingRoomNumber
        if res.checkOut == 'n':
            data['livingState'] = '재실'
        else:
            data['livingState'] = '퇴실'
        data['residentName'] = res.residentName
        data['contractorGender'] = res.contractorGender
        data['leaseNumber'] = res.leaseNumber
        data['leaseType'] = res.leaseType
        data['inDate'] = str(res.inDate).replace('-', '.')
        data['outDate'] = str(res.outDate).replace('-', '.')
        serialized.append(data)
    return serialized


def toJSON(objs, status=200):
    j = json.dumps(objs, ensure_ascii=False)
    return HttpResponse(j, status=status, content_type='application/json; charset=utf-8')
