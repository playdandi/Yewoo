# -*- coding: utf-8 -*-

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render, redirect
#from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from buildingApp.models import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
import re

def main_html(request):
    return render(request, 'main.html')

def newmain_html(request):
    if not request.user.is_authenticated():
        username = u"김지훈"
    else:
        username = request.user.username
    data = {'username' : username}
    return render(request, 'newmain.html', data)

def login_request(request, data = None):
    if request.method == "POST":
        param = {}
        if data == None:
            for name in request.POST:
                param[name] = request.POST.get(name, '').strip()
        else:
            param = data

        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return render(request, 'index.html')
                # Redirect to a success page.
            else:
                # Return a 'disabled account' error message
                return HttpResponse("승인되지 않은 회원입니다.", status=404)
        else:
            return HttpResponse("아이디나 비밀번호를 잘못 입력하셨습니다.", status=404)
            # Return an 'invalid login' error message.


    else:
        return render(request, 'login.html')

def logout_request(request):
    logout(request)
    return redirect('/login/')

def signup(request, data = None):
    if request.method == "POST":
        param = {}
        if data == None:
            for name in request.POST:
                param[name] = request.POST.get(name, '').strip()
        else:
            param = data

        systemId = param['systemId']
        result = isValidID(systemId)
        if result != "success":
            return HttpResponse(result, status=404)
        
        if param['systemPass1'] != param['systemPass2']:
            return HttpResponse("비밀번호가 일치하지 않습니다.", status=404)
        systemPass = param['systemPass1']
        if not re.match(r'[A-Za-z0-9@#$%^&+=]{6,15}', systemPass):
            return HttpResponse("비밀번호가 형식에 맞지 않습니다.", status=404)
       
        systemPassHint = param['systemPassHint']
        signupName = param['signupName']
        signupBirthday = param['signupBirthday']
        signupGender = param['signupGender']
        signupDepartment = param['signupDepartment']
        signupPosition = param['signupPosition']
        signupJoinDate = param['signupJoinDate']
        signupContact1 = param['signupContact1']
        signupContact2 = param['signupContact2']
        signupAddress = param['signupAddress']

        if signupName == "" or signupBirthday == "" or signupGender == "" or signupDepartment == "" or signupPosition == "" or signupJoinDate == "" or signupContact1 == "" or signupAddress == "":
            return HttpResponse("빨간색으로 표시된 항목은 필수항목입니다.", status=404)
            
        try:
            user = User.objects.create_user(systemId, password=systemPass)
            user.is_active = False
            user.save()
            profile = UserProfile()
            profile.user = user
            profile.passhint = systemPassHint
            profile.name = signupName
            profile.birthday = signupBirthday
            profile.gender = signupGender
            profile.department = signupDepartment
            profile.position = signupPosition
            profile.joindate = signupJoinDate
            profile.contact1 = signupContact1
            profile.contact2 = signupContact2
            profile.address = signupAddress
            profile.status = 0 # NEWBIE
            profile.save() 
        except:
            user.delete()
            ret = HttpResponse("회원가입에 실패하였습니다.", status=404)
            return ret

        ret = render(request, 'index.html')
        return ret 
    else:
        return render(request, 'signup.html')

def checkid(request, data = None):
    if request.method == "POST":
        param = {}
        if data == None:
            for name in request.POST:
                param[name] = request.POST.get(name, '').strip()
        else:
            param = data

        systemId = param['systemId']
        result = isValidID(systemId)
        if result != "success":
            return HttpResponse(result, status=404)
        else: 
            return render(request, 'index.html')
    else:
        return HttpResponse("error", status=400)

def isValidID(systemId):
   valid = re.match('^[\w-]+$', systemId)
   if valid == None:
       return "아이디는 띄어쓰기 없이 영문/숫자로 구성되어야 합니다"
   if len(systemId) < 6 or len(systemId) > 10:
       return "아이디는 6~10자로 구성되어야 합니다"
   if User.objects.filter(username=systemId).exists():
       return "이미 사용중인 아이디입니다"
   else: 
       return "success"

