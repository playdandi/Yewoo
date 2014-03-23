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

    return param

def lease_show_html(request):
    return render(request, '03_01_lease_show.html', setPostData(request))

def lease_notice_detail_show_html(request, bid, rnum):
    return render(request, '03_01_lease_notice_detail_show.html')

def notice_show_html(request):
    return render(request, '03_01_notice_show.html', setPostData(request))

def payment_show_html(request):
    return render(request, '03_01_payment_show.html', setPostData(request))

def get_lease_info(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
	data = ResidentInfo.objects.filter(buildingName = bid)
	return toJSON(serialize_lease(data))
    return HttpResponse('NOT POST')

def get_notice_info(request):
    if request.method == 'POST':
        y = int(request.POST['year'])
        m = int(request.POST['month'])
        bid = int(request.POST['building_id'])
	data = EachMonthInfo.objects.filter(year = y, month = m, building = bid)
	return toJSON(serialize_notice(data))
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
    for res in result:
        data = {}
        data['buildingnum'] = res.buildingName
        data['roomnum'] = res.buildingRoomNumber
        data['name'] = res.contractorName
        data['deposit'] = res.leaseDeposit
        data['money'] = res.leaseMoney
        data['parking'] = res.parkingFee
        data['payway'] = res.leasePayWay
        data['paydate'] = res.leasePayDate
        data['indate'] = prettyDate(res.inDate)
        data['outdate'] = prettyDate(res.outDate)
        serialized.append(data)
    return serialized

## prettify data for lease
def serialize_notice(result):
    serialized = []
    for res in result:
        if(res.inputCheck == True and res.noticeCheck == True):
            data = {}
            total = 0
            data['buildingnum'] = res.resident.buildingName
            data['roomnum'] = res.resident.buildingRoomNumber
            data['name'] = res.resident.contractorName
            data['yearmonth'] = str(res.year) + "/" + str(res.month)
            data['lease'] = res.leaseMoney
            total += res.leaseMoney
            data['maintenance'] = res.maintenanceFee
            total += res.maintenanceFee
            data['surtax'] = res.surtax
            total += res.surtax
            data['parking'] = res.parkingFee
            total += res.parkingFee
            data['electricity'] = res.electricityFee
            total += res.electricityFee
            data['water'] = res.waterFee
            total += res.waterFee
            data['gas'] = res.gasFee         
            total += res.gasFee
            data['total'] = total
            data['noticedate'] = prettyDateWOYear(res.noticeDate)
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
            deletedObjs.delete()

            # save new data
            for obj in newObjs:
                obj.save()
                
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

def notice_detail_input_html(request, bid, rid):
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
    return render(request, '03_03_payment.html', setPostData(request, 'payment'))

## prettify data for payment
def serialize_payment(result):
    serialized = []
    for i in range(len(result)):
        if i > 0 and int(result[i].resident.id) == int(result[i-1].resident.id):
            continue
        data = {}
        data['id'] = result[i].id
        data['checked'] = int(result[i].checked)
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



def payment_detail_html(request, bid, rid, tab):
    param = {}
    param['tab'] = int(tab)
    param['bid'] = int(bid)
    param['rid'] = int(rid)

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
        #print(paymentIds)
        data = PaymentModifyInfo.objects.filter(payment__in = paymentIds).order_by('-id')
        #print(data)
        return toJSON(serialize_paymentModifyInfo(data))
    return HttpResponse('NOT POST')



def payment_detail_saveInput(request):
    if request.method == 'POST':
        #insert inputted payment info
        elem = PaymentInfo()
        elem.building = BuildingInfo.objects.get(id = int(request.POST['building_id']))
        print(int(request.POST['resident_id']))
        elem.resident = ResidentInfo.objects.get(id = int(request.POST['resident_id']))
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





