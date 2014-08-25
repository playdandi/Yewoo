# -*- coding: utf-8 -*-

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render, redirect
from django.template import RequestContext, loader
from django.middleware.csrf import get_token
from buildingApp.models import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import re, os

#def main_html(request):
#    return render(request, 'main.html')

@login_required(login_url='/login/')
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
            profile.address2 = ""
            profile.email = ""
            profile.introduce = ""
            profile.status = 0 # NEWBIE
            profile.save() 
        except:
            user.delete()
            ret = HttpResponse("회원가입에 실패하였습니다.", status=404)
            return ret

        ret = render(request, 'index.html')
        return ret 
    else:
        departments = DepartmentList.objects.all()
        positions = PositionList.objects.all()
        return render_to_response('signup.html', \
                                    {'departments' : departments, 'positions' : positions} , \
                                    context_instance=RequestContext(request))

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

@login_required(login_url='/login/')
def myprofile_html(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        type = request.POST['type']
        if type == '1':
            user = request.user
            userprofile = user.userprofile
            userprofile.name = request.POST['name']
            userprofile.birthday = request.POST['birthday']
            userprofile.gender = request.POST['gender']
            userprofile.status = request.POST['status']
            userprofile.department = request.POST['department']
            userprofile.position = request.POST['position']
            userprofile.joindate = request.POST['joindate']
            if request.POST['exitdate'] == "":
                userprofile.exitdate = None
            else:
                userprofile.exitdate = request.POST['exitdate']
            if request.POST['companynumber'] == "":
                userprofile.companynumber = None
            else:
                userprofile.companynumber = request.POST['companynumber']
            userprofile.contact1 = request.POST['contact1']
            userprofile.contact2 = request.POST['contact2']
            userprofile.email = request.POST['email']
            userprofile.address = request.POST['address']
            userprofile.address2 = request.POST['address2']
            userprofile.save()
            return render(request, 'index.html')
        elif type == '2':
            user = request.user
            acaExisting = AcademicCareer.objects.filter(user=user)
            for aca in acaExisting:
                aca.delete()
            acaNum = int(request.POST['arraynum'])
            for i in range(acaNum):
                aca = AcademicCareer()
                aca.user = user
                aca.period = request.POST['period' + str(i)]
                aca.name = request.POST['name' + str(i)]
                aca.location = request.POST['location' + str(i)]
                aca.major = request.POST['major' + str(i)]
                aca.gpa = request.POST['gpa' + str(i)]
                aca.maxgpa = request.POST['maxgpa' + str(i)]
                aca.etc = request.POST['etc' + str(i)]
                aca.save()
            return render(request, 'index.html')
        elif type == '3':
            user = request.user
            workExisting = WorkCareer.objects.filter(user=user)
            for work in workExisting:
                work.delete()
            workNum = int(request.POST['arraynum'])
            for i in range(workNum):
                work = WorkCareer()
                work.user = user
                work.period = request.POST['period' + str(i)]
                work.name = request.POST['name' + str(i)]
                work.position = request.POST['position' + str(i)]
                work.mission = request.POST['mission' + str(i)]
                work.save()
            return render(request, 'index.html')
        elif type == '4':
            user = request.user
            userprofile = user.userprofile
            userprofile.introduce = request.POST['introduce']
            userprofile.save()
            return render(request, 'index.html')
        else:
            return HttpResponse("에러가 발생하였습니다.", status=404)

    else:
        try:
            username = request.user.userprofile.name
        except:
            username = ""
        try:
            user = request.user
            departments = DepartmentList.objects.all()
            positions = PositionList.objects.all()
            available_companynum = []
            min_number = int(SystemSettings.objects.get(name="companynum_min").value)
            max_number = int(SystemSettings.objects.get(name="companynum_max").value)
            for number in range(min_number, max_number+1):
                try:
                    cn_user = UserProfile.objects.get(companynumber = number)
                    if cn_user.user == user:
                        available_companynum.append(number)
                except:
                    available_companynum.append(number)
            academics = AcademicCareer.objects.filter(user=user)
            works = WorkCareer.objects.filter(user=user)
            
            PERSON_IMG_DIR = os.path.join(os.path.dirname(__file__), 'static/person_img')
            imgfile = "empty.png"
            for file_name in os.listdir(PERSON_IMG_DIR):
                if file_name.lower().startswith(str(request.user.id) + '.'):
                    imgfile = file_name
                    break
                    
            return render_to_response('myprofile.html', \
                                        {'user' : user, 'username' : username, 'avail_nums' : available_companynum, \
                                        'departments' : departments, 'positions' : positions , \
                                        'academics' : academics, 'works' : works, 'imgfile' : imgfile} , \
                                        context_instance=RequestContext(request))
        except Exception as e:
            print e
            return HttpResponse("에러가 발생하였습니다.", status=404)

@login_required(login_url='/login/')
def myprofile_upload_html(request):
    if request.method == "POST":
        if 'file' in request.FILES:
            file = request.FILES['file']
#            filename = file._name
            filename = str(request.user.id) + '.' + file._name.split('.')[-1]
            UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'static/person_img')

            for file_name in os.listdir(UPLOAD_DIR):
                if file_name.lower().startswith(str(request.user.id) + '.'):
                    file_path = os.path.join(UPLOAD_DIR, file_name)
                    try:
                        if os.path.isfile(file_path):
                            os.unlink(file_path)
                    except Exception, e:
                        print e


            fp = open('%s/%s' % (UPLOAD_DIR, filename) , 'wb')
            for chunk in file.chunks():
                fp.write(chunk)
            fp.close()
            return HttpResponse('<script>alert("사진을 성공적으로 업로드하였습니다.");window.opener.location.href = "/myprofile/";window.close();</script>')

    else:
        return render_to_response('myprofile_upload.html', \
                                    {} , \
                                    context_instance=RequestContext(request))

