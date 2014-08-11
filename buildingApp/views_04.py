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
    return render(request, '04_02_accountinfo.html')

def accountinfo_detail_html(request):
    return render(request, '04_02_accountinfo_detail.html')

def right_html(request):
    return render(request, '04_03_right.html')


################### 부서와 직급 설정 ###################
def setting_department_html(request):
	tp = TeamPosition.objects.all()
	team = []
	team_id = []
	pos = []
	pos_id = []
	all_t = ''
	all_p = ''
	for k in tp:
		if int(k.category) == 1:
			team.append( {'id' : int(k.id), 'name' : str(k.name)} )
			team_id.append( int(k.id) )
			all_t += str(k.name) + '  '
		else:
			pos.append( {'id' : int(k.id), 'name' : str(k.name)} )
			pos_id.append( int(k.id) )
			all_p += str(k.name) + '  '

	param = {}
	param['numOfTeam'] = len(team)
	param['team'] = team
	param['team_id'] = json.dumps(team_id)
	param['all_teamname'] = all_t.strip()
	param['numOfPos'] = len(pos)
	param['position'] = pos
	param['position_id'] = json.dumps(pos_id)
	param['all_posname'] = all_p.strip()

	return render_to_response('04_04_setting_department.html', param, context_instance=RequestContext(request))

### 관리자시스템 - 시스템설정 : 부서/직급 추가 ###
def setting_department_add(request):
	if request.method == 'POST':
		category = int(request.POST['category'])
		name = str(request.POST['name'])
		tp = TeamPosition()
		tp.category = category
		tp.name = name
		tp.save()
		return HttpResponse('OK')
	return HttpResponse('NOT POST')

### 관리자시스템 - 시스템설정 : 부서/직급 이름변경 ###
def setting_department_change(request):
	if request.method == 'POST':
		tp_id = int(request.POST['id'])
		name = str(request.POST['name'])
		tp = TeamPosition.objects.get(id = tp_id)
		tp.name = name
		tp.save()
		return HttpResponse('OK')
	return HttpResponse('NOT POST')

### 관리자시스템 - 시스템설정 : 부서/직급 삭제 ###
def setting_department_delete(request):
	if request.method == 'POST':
		ids = request.POST.getlist('ids[]')
		TeamPosition.objects.filter(id__in = ids).delete()
		return HttpResponse('OK')
	return HttpResponse('NOT POST')


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




























