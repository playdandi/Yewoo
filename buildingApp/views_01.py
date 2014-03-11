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



