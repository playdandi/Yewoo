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

def setting_department_html(request):
    return render(request, '04_04_setting_department.html')

def setting_delay_html(request):
    return render(request, '04_04_setting_delay.html')
