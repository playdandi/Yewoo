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
