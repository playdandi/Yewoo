# -*- coding: utf-8 -*-

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from django.db.models import Q
import json
from buildingApp.models import *
from django.conf import settings
import os, datetime
from django.contrib.auth.models import User

def activate_html(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        user_id = request.POST['user_id']
        try:
            newbie = User.objects.get(id=user_id)
            newbie.is_active = True
            newbie.userprofile.status = 1
            newbie.userprofile.activatedate = datetime.date.today()
            newbie.userprofile.activateadmin = request.user.userprofile.name
            newbie.userprofile.save()
            newbie.save()
            return render(request, 'index.html')
        except:
            return HttpResponse("에러가 발생하였습니다.", status=404)
    else:
        newbies = User.objects.filter(is_active=False, userprofile__status=0)
        try:
           username = request.user.userprofile.name
        except:
            username = ""
        return render_to_response('04_01_activate.html', \
                                    {'newbies' : newbies, 'username' : username} , \
                                    context_instance=RequestContext(request))

def accountinfo_html(request):
    users = User.objects.filter(is_superuser=False).exclude(userprofile__status=0)
    try:
       username = request.user.userprofile.name
    except:
        username = ""
    return render_to_response('04_02_accountinfo.html', \
                                {'users' : users, 'username' : username} , \
                                context_instance=RequestContext(request))

def accountinfo_detail_html(request, uid):
    try:
       username = request.user.userprofile.name
    except:
        username = ""
    try:
        user = User.objects.get(id=uid)
        return render_to_response('04_02_accountinfo_detail.html', \
                                    {'user' : user, 'username' : username} , \
                                    context_instance=RequestContext(request))
    except:
        return HttpResponse("에러가 발생하였습니다.", status=404)

def right_html(request):
    return render(request, '04_03_right.html')


################### 부서와 직급 설정 ###################
def setting_department_html(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        type = request.POST['type']
        if type == "add":
            data = request.POST['data']
            newDep = DepartmentList()
            newDep.name = data
            newDep.save()
            return render(request, 'index.html')
        elif type == "del":
            data = request.POST['data']
            delDep = DepartmentList.objects.get(id=int(data))
            delDep.delete()
            return render(request, 'index.html')
        elif type == "mod":
            data = request.POST['data']
            data2 = request.POST['data2']
            modDep = DepartmentList.objects.get(id=int(data))
            modDep.name = data2
            modDep.save()
            return render(request, 'index.html')
        else:
            return HttpResponse("에러가 발생하였습니다.", status=404)

    else:
        departments = DepartmentList.objects.all()
        department_out = []
        department_in = []
        for i in range(len(departments)):
            department_in.append(departments[i])
            if i % 5 == 4 or i == len(departments) - 1:
                department_out.append(department_in)
                department_in = []

        return render_to_response('04_04_setting_department.html', \
                                    {'departments' : departments, 'department_out' : department_out} , \
                                    context_instance=RequestContext(request))

def setting_position_html(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        type = request.POST['type']
        if type == "add":
            data = request.POST['data']
            newPos = PositionList()
            newPos.name = data
            newPos.save()
            return render(request, 'index.html')
        elif type == "del":
            data = request.POST['data']
            delPos = PositionList.objects.get(id=int(data))
            delPos.delete()
            return render(request, 'index.html')
        elif type == "mod":
            data = request.POST['data']
            data2 = request.POST['data2']
            modPos = PositionList.objects.get(id=int(data))
            modPos.name = data2
            modPos.save()
            return render(request, 'index.html')
        else:
            return HttpResponse("에러가 발생하였습니다.", status=404)

    else:
        positions = PositionList.objects.all()
        position_out = []
        position_in = []
        for i in range(len(positions)):
            position_in.append(positions[i])
            if i % 5 == 4 or i == len(positions) - 1:
                position_out.append(position_in)
                position_in = []

        return render_to_response('04_04_setting_position.html', \
                                    {'positions' : positions, 'position_out' : position_out} , \
                                    context_instance=RequestContext(request))



def setting_adjustment_html(request):
	bi = BuildingInfo.objects.all()
	buildingList = []
	all_sp_id = []
	all_sp_mt = []
	all_sp_dr = []
	cnt = 0
	for b in bi:
		cnt += 1
		sp = SettingPayment.objects.filter(building_id = int(b.id)).order_by('month')
		months = []
		for s in sp:
			months.append( {'id' : int(s.id), 'month' : int(s.month), 'delayRate' : float(s.delayRate)} )
			#all_sp.append( {'id' : int(s.id), 'month' : int(s.month), 'delayRate' : int(s.delayRate)} )
			all_sp_id.append( int(s.id) )
			all_sp_mt.append( int(s.month) )
			all_sp_dr.append( float(s.delayRate) )
		buildingList.append( {'id' : int(b.id), 'name' : str(b.name), 'months' : months, 'cnt' : int(cnt)} )

		'''
		possibleSelect = []
		for i in range(1, 12+1):
			flag = True
			for m in months:
				if int(m['month']) == int(i):
					flag = False
					break
			if flag:
				possibleSelect.append(i)
		buildingList.append( {'id' : int(b.id), 'name' : str(b.name), 'months' : months, 'possibleSelect' : possibleSelect, 'cnt' : int(cnt)} )
		'''

	param = {}
	param['numOfBuilding'] = len(buildingList)
	param['buildingList'] = buildingList
	param['sp_id'] = json.dumps(all_sp_id)
	param['sp_month'] = json.dumps(all_sp_mt)
	param['sp_delayRate'] = json.dumps(all_sp_dr)
	return render_to_response('04_04_setting_adjustment.html', param, context_instance=RequestContext(request))

### 관리자시스템 - 시스템설정 : 고지내역 연체 추가 ###
def setting_adjustment_add(request):
	if request.method == 'POST':
		bid = int(request.POST['bid'])
		month = int(request.POST['month'])
		delayRate = float(request.POST['delayRate'])
		sp = SettingPayment()
		sp.building = BuildingInfo.objects.get(id = bid)
		sp.month = month
		sp.delayRate = delayRate
		sp.save()
		return HttpResponse('OK')
	return HttpResponse('NOT POST')


### 관리자시스템 - 시스템설정 : 고지내역 연체 변경 ###
def setting_adjustment_change(request):
	if request.method == 'POST':
		spid = int(request.POST['spid'])
		delayRate = float(request.POST['delayRate'])
		sp = SettingPayment.objects.get(id = spid)
		sp.delayRate = delayRate
		sp.save()
		return HttpResponse('OK')
	return HttpResponse('NOT POST')

### 관리자시스템 - 시스템설정 : 고지내역 연체 삭제 ###
def setting_adjustment_delete(request):
	if request.method == 'POST':
		spid = int(request.POST['spid'])
		SettingPayment.objects.get(id = spid).delete()
		return HttpResponse('OK')
	return HttpResponse('NOT POST')