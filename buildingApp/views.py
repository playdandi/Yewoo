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

def main_html(request):
    return render(request, 'main.html')


def building_register_html(request):
    csrf_token = get_token(request)
    buildingAll = BuildingInfo.objects.all()
    building_info = []
    for i in range(1, 20+1):
        flag = False
        for b in buildingAll:
            if i == b.number:
                building_info.append({'number' : b.number, 'name' : b.name})
                flag = True
                break
        if not flag:
            building_info.append({'number' : i, 'name' : ''})
    
    return render(request, '01_01_building_register.html', {'range' : range(1, 20+1), 'building_info' : building_info})

def building_save(request):
    if request.method == "POST":
        param = {}
        maxFloorNum = 0
        for name in request.POST:
            if 'floors' in name:
                f = name.split('[')[1].split(']')[0]
                if int(f) > maxFloorNum:
                    maxFloorNum = int(f)
            else:
                param[name] = request.POST.get(name, '').strip()

        building = BuildingInfo()
        building.number = param['number']
        building.type = param['type']
        building.name = param['name']
        building.remote = param['remote']
        building.address = param['address']
        building.manager = param['manager']
        building.floorFrom = param['floorFrom']
        building.floorTo = param['floorTo']
        building.numRoom = param['numRoom']
        building.numStore = param['numStore']
        building.numParking = param['numParking']
        building.save()

        floors = []
        for i in range(maxFloorNum+1):
            floors.append({});
        for name in request.POST:
            if 'floors' in name:
                pos = int(name.split('[')[1].split(']')[0])
                var = name.split('[')[2].split(']')[0].strip()
                floors[pos][var] = request.POST.get(name, '')
        
        b = BuildingInfo.objects.get(number=param['number'])
        for f in floors:
            bFloor = BuildingFloor()
            bFloor.building_id = b.id
            bFloor.floor = f['floor']
            bFloor.roomNum = f['roomNum']
            if b.type != 0:
                bFloor.hasStore = f['hasStore']
                if f['hasStore'] == 'y':
                    bFloor.storeNum = f['storeNum']
                    bFloor.storeNames = f['storeNames']
            bFloor.hasParking = f['hasParking']
            bFloor.parkingNum = f['parkingNum']
            bFloor.save()
        return HttpResponse('', status=200)


def building_search_building_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    buildings = []
    for b in building:
        buildings.append({'name' : b.name, 'number' : b.number})
    return render(request, '01_02_building_search.html', {'range' : range(1, 20+1), 'buildings' : buildings})

def building_search(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()
        
        if int(param['sType']) == 2:
            # show all buildings
            result = BuildingInfo.objects.all()
            return toJSON(serialize_building(result))
        elif int(param['sType']) == 0:
            # search
            word = param['keyword']
            result = []

            import re
            if re.sub('[0-9]+', '', word) == '':
                result = BuildingInfo.objects.filter(
                    Q(name=word) | Q(number=word) | Q(manager=word))
            else:
                result = BuildingInfo.objects.filter(
                    Q(name=word) | Q(manager=word))

            return toJSON(serialize_building(result))
        else:
            # search detail
            result = BuildingInfo.objects
            for p in param:
                if param[p] != '':
                    print(p, param[p])
                    if p == 'name':
                        result = result.filter(name = param[p])
                    elif p == 'number':
                        result = result.filter(number = param[p])
                    elif p == 'type':
                        result = result.filter(type = param[p])
                    elif p == 'manager':
                        result = result.filter(manager = param[p])
                    elif p == 'sFloor':
                        result = result.filter(floorFrom__gte = int(param[p]))
                    elif p == 'eFloor':
                        result = result.filter(floorTo__lte = int(param[p]))
                    elif p == 'parkingNum':
                        result = result.filter(numParking = param[p])
            return toJSON(serialize_building(result))


def building_show_contents_html(request, uid):
    #csrf_token = get_token(request)
    building = BuildingInfo.objects.get(id = uid)
    building.floorFromabs = abs(building.floorFrom)
    building.floorToabs = abs(building.floorTo)

    floors = BuildingFloor.objects.filter(building_id = uid).order_by('floor')
    for f in floors:
        f.floorabs = abs(f.floor)
        if f.floor < 0:
            f.floorabs = 'B ' + str(f.floorabs)
        if f.floor < 0:
            f.floorKor = '지하 ' + str(abs(f.floor)) + '층'
        else:
            f.floorKor = '지상 ' + str(abs(f.floor)) + '층'
    
    buildingAll = BuildingInfo.objects.all()
    building_info = []
    for i in range(1, 20+1):
        flag = False
        for b in buildingAll:
            if i == b.number:
                building_info.append({'number' : b.number, 'name' : b.name})
                flag = True
                break
        if not flag:
            building_info.append({'number' : i, 'name' : ''})
    
    return render(request, '01_04_building_show_contents.html',
            {'range' : range(1, 20+1), 'building_info' : building_info, 'building' : building, 'floors' : floors, 'building_id' : uid})

def building_update(request, uid):
    if request.method == "POST":
        param = {}
        maxFloorNum = 0
        for name in request.POST:
            if 'floors' in name:
                f = name.split('[')[1].split(']')[0]
                if int(f) > maxFloorNum:
                    maxFloorNum = int(f)
            else:
                param[name] = request.POST.get(name, '').strip()

        building = BuildingInfo.objects.get(id = uid)
        building.number = param['number']
        building.type = param['type']
        building.name = param['name']
        building.remote = param['remote']
        building.address = param['address']
        building.manager = param['manager']
        building.floorFrom = param['floorFrom']
        building.floorTo = param['floorTo']
        building.numRoom = param['numRoom']
        building.numStore = param['numStore']
        building.numParking = param['numParking']
        building.save()

        floors = []
        for i in range(maxFloorNum+1):
            floors.append({})
        for name in request.POST:
            if 'floors' in name:
                pos = int(name.split('[')[1].split(']')[0])
                var = name.split('[')[2].split(']')[0].strip()
                floors[pos][var] = request.POST.get(name, '')
        
        floorsDB = BuildingFloor.objects.filter(building_id = uid)
        # -2 -1 1 2 3 4 // floorsDB
        # -1 1 2 3 4 5  // floors
        # 없어진 층은 삭제
        for fdb in floorsDB:
            flag = False
            for f in floors:
                if int(f['floor']) == fdb.floor:
                    flag = True
                    break
            if not flag:
                fdb.delete()
        
        # 있는건 update, 없는건 새로 insert
        floorsDB = BuildingFloor.objects.filter(building_id = uid)
        for f in floors:
            flag = False
            for fdb in floorsDB:
                if int(f['floor']) == fdb.floor:
                    fdb.roomNum = f['roomNum']
                    if int(param['type']) == 0:
                        fdb.hasStore = None
                        fdb.storeNum = None
                        fdb.storeNames = None
                    else:
                        fdb.hasStore = f['hasStore']
                        if f['hasStore'] == 'y':
                            fdb.storeNum = f['storeNum']
                            fdb.storeNames = f['storeNames']
                        else:
                            fdb.storeNum = 0
                            fdb.storeNames = ''
                    fdb.hasParking = f['hasParking']
                    fdb.parkingNum = f['parkingNum']
                    fdb.save()
                    flag = True
                    break

            if not flag: # 없으면 newly insert
                fdb = BuildingFloor()
                fdb.building_id = int(param['number'])
                fdb.floor = f['floor']
                fdb.roomNum = f['roomNum']
                if int(param['type']) != 0:
                    fdb.hasStore = f['hasStore']
                    if f['hasStore'] == 'y':
                        fdb.storeNum = f['storeNum']
                        fdb.storeNames = f['storeNames']
                fdb.hasParking = f['hasParking']
                fdb.parkingNum = f['parkingNum']
                fdb.save()

        return HttpResponse('', status=200)

def building_search_rooms_html(request):
    csrf_token = get_token(request)
    building = BuildingInfo.objects.all()
    buildings = []
    for b in building:
        buildings.append({'name' : b.name, 'number' : b.number})
    return render(request, '01_03_building_search_rooms.html', {'range' : range(1, 20+1), 'buildings' : buildings})



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
        resident.inDate = param['inDate'].replace('.', '-')
        resident.outDate = param['outDate'].replace('.', '-')
        resident.leaseType = param['leaseType']
        resident.leaseDeposit = param['leaseDeposit']
        resident.leasePayWay = param['leasePayWay']
        resident.leasePayDate = param['leasePayDate']
        resident.leaseMoney = param['leaseMoney']
        resident.agency = param['agency']
        resident.agencyName = param['agencyName']

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

        resident.contractorName = param['contractorName']
        resident.contractorGender = param['contractorGender']
        resident.contractorRegNumber = param['contractorRegNumber']
        resident.contractorContactNumber1 = param['contractorContactNumber1']
        if param['contractorContactNumber2'] != '--':
            resident.contractorContactNumber2 = param['contractorContactNumber2']
        resident.contractorAddress = param['contractorAddress']

        resident.residentName = param['residentName']
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
            resident.parkingFee = 0
        resident.sendMsg = param['sendMsg']
        resident.checkin = param['checkin']
        resident.checkout = param['checkout']
        resident.memo = param['memo']

        resident.save()

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
    if result.checkout == 'y':
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
    #floor = BuildingFloor.objects.filter(building_id = uid)
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

def serialize_building(result):
    serialized = []
    for res in result:
        data = {}
        data['id'] = res.id
        data['number'] = res.number
        data['name'] = res.name
        data['type'] = res.type
        data['manager'] = res.manager
        data['floorFrom'] = res.floorFrom
        data['floorTo'] = res.floorTo
        data['numRoom'] = res.numRoom
        data['numParking'] = res.numParking
        serialized.append(data)
    return serialized


def toJSON(objs, status=200):
    j = json.dumps(objs, ensure_ascii=False)
    return HttpResponse(j, status=status, content_type='application/json; charset=utf-8')


################################################
#################### Chap.3 ####################
################################################

def setPostData(request):
    param = {}
    if request.method == 'GET':
        print('get')
        import datetime
        ym = datetime.datetime.now()
        param['search_year'] = int(ym.year)
        param['search_month'] = int(ym.month)
        param['search_building_id'] = 1
    elif request.method == 'POST':
        print('post')
        param['search_year'] = int(request.POST['year'])
        param['search_month'] = int(request.POST['month'])
        param['search_building_id'] = int(request.POST['building_id'])
    
    building = BuildingInfo.objects.all()
    building_name_id = []
    for b in building:
        building_name_id.append({'name' : b.name, 'id' : b.id})
    param['building_name_id'] = building_name_id
    search_year_list = []
    for i in range(2013, 2017):
        search_year_list.append(i)
    search_month_list = []
    for i in range(1, 13):
        search_month_list.append(i)
    param['search_year_list'] = search_year_list
    param['search_month_list'] = search_month_list

    return param

def lease_show_html(request):
    return render(request, '03_01_lease_show.html', setPostData(request))

def lease_notice_detail_show_html(request, bid, rnum):
    return render(request, '03_01_lease_notice_detail_show.html')

def notice_show_html(request):
    return render(request, '03_01_notice_show.html', setPostData(request))


'''
def electricity_show_html(request):
    if request.method == "POST":
        yy = int(request.POST.get('year'))
        mm = int(request.POST.get('month'))
        b_id = int(request.POST.get('building_id'))
        r_num = request.POST.get('room_num')
        if r_num != '':
            r_num = int(r_num)

        # 01. get resident_ID list by b_id & r_num
        resident_IDs = []
        if r_num == '':
            resident_IDs = ResidentInfo.objects.filter(buildingName = b_id).order_by('id').values('id')
        else:
            resident_IDs = ResidentInfo.objects.filter(buildingName = b_id, buildingRoomNumber = r_num).order_by('id').values('id')
        
        # 02. get electricity info. by year & month & resident_IDs
        electricity = ElectricityInfo.objects.filter(year = yy, month = mm, resident_id__in = resident_IDs).order_by('resident_id')

        ### assert : resident_IDs & electricity lists have EXACTLY same number of elements.

        # 03. join two lists (make one final list)
        result = []
        for r in resident_IDs:
            temp = {r}
            for e in electricity:
                if int(e.resident_id) == int(r):
                    temp = dict(temp.items() + e.items())
                    break
            result.append(temp)

        # 04. done
        csrf_token = get_token(request)
        building = BuildingInfo.objects.all()
        building_name_id = []
        for b in building:
            building_name_id.append({'name' : b.name, 'id' : b.id})

        return render(request, '03_01_electricity_show.html', {'building_name_id' : building_name_id, 'result' : result})
'''
def electricity_show_html(request):
    return render(request, '03_01_electricity_show.html', setPostData(request))

def gas_show_html(request):
    return render(request, '03_01_gas_show.html', setPostData(request))

def water_show_html(request):
    return render(request, '03_01_water_show.html', setPostData(request))


def excel_file_upload(request):
    if request.method == 'POST':
        if 'file' in request.FILES:
            # save the info. into DB
            fileInfo = None
            building_info = BuildingInfo.objects.get(id = request.POST['building_id'])
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
        fileInfo = ExcelFiles.objects.get(id = int(request.POST['excelFile_id']))
        # delete the actual excel file
        os.remove(os.path.join(settings.MEDIA_ROOT, fileInfo.type) + '/' + fileInfo.filename)
        # delete the info. in DB
        fileInfo.delete()

        return HttpResponse('file delete - SUCCESS')
    return HttpResponse('file delete - NOT POST')

def check_input_html(request):
    return render(request, '03_02_check_input.html', setPostData(request))

def notice_input_html(request):
    return render(request, '03_02_notice_input.html', setPostData(request))

def notice_detail_input_html(request):
    return render(request, '03_02_notice_detail_input.html', setPostData(request))

def electricity_input_html(request):
    return render(request, '03_02_electricity_input.html', setPostData(request))

def gas_input_html(request):
    return render(request, '03_02_gas_input.html', setPostData(request))

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
    return render(request, '03_02_water_input.html', setPostData(request))


##### 03_03 : payment #####

def payment_input_html(request):
    return render(request, '03_03_payment.html', setPostData(request))

def payment_detail_html(request):
    return render(request, '03_03_payment_detail.html', setPostData(request))
