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

    return param

def lease_show_html(request):
    return render(request, '03_01_lease_show.html', setPostData(request))

def lease_notice_detail_show_html(request, bid, rnum):
    return render(request, '03_01_lease_notice_detail_show.html')

def notice_show_html(request):
    return render(request, '03_01_notice_show.html', setPostData(request))

def payment_show_html(request):
    return render(request, '03_01_payment_show.html', setPostData(request))

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
            fileInfo.uploadDate = request.POST['uploadDate'].replace('.', '-').strip()
            fileInfo.save()

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

            #print(column)
            #print(result)

            # 2. delete current data
            if str(request.POST['type']) == 'electricity':
                ElectricityInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = building_info).delete()
            elif str(request.POST['type']) == 'gas':
                GasInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = building_info).delete()
            elif str(request.POST['type']) == 'water':
                WaterInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = building_info).delete()

            # 3. save new data
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
                    elem.save()
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
                    elem.save()
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
                    elem.save()
                

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
        if typestr == 'electricity':
            ElectricityInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = int(request.POST['bid'])).delete()
        elif typestr == 'gas':
            GasInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = int(request.POST['bid'])).delete()
        elif typestr == 'water':
            WaterInfo.objects.filter(year = int(request.POST['year']), month = int(request.POST['month']), building = int(request.POST['bid'])).delete()
        return HttpResponse('file delete - SUCCESS')
    return HttpResponse('file delete - NOT POST')

def check_input_html(request):
    return render(request, '03_02_check_input.html', setPostData(request))

def notice_input_html(request):
    return render(request, '03_02_notice_input.html', setPostData(request))

def notice_detail_input_html(request):
    return render(request, '03_02_notice_detail_input.html', setPostData(request))

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
    return render(request, '03_03_payment.html', setPostData(request))

def payment_detail_html(request):
    return render(request, '03_03_payment_detail.html', setPostData(request))
