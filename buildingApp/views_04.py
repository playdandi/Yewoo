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
from django.contrib.auth.models import User, Permission
from django.contrib.auth.decorators import permission_required

@permission_required('buildingApp.manage_activate', login_url='/login/')
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

@permission_required('buildingApp.manage_accountinfo', login_url='/login/')
def accountinfo_html(request):
    users = User.objects.filter(is_superuser=False).exclude(userprofile__status=0)
    
    PERSON_IMG_DIR = os.path.join(os.path.dirname(__file__), 'static/person_img')
    for user in users:
        user.hasimage = False
        for file_name in os.listdir(PERSON_IMG_DIR):
            if file_name.lower().startswith(str(user.id) + '.'):
                user.imgfile = file_name
                user.hasimage = True
                break
    try:
       username = request.user.userprofile.name
    except:
        username = ""
    return render_to_response('04_02_accountinfo.html', \
                                {'users' : users, 'username' : username} , \
                                context_instance=RequestContext(request))

@permission_required('buildingApp.manage_accountinfo', login_url='/login/')
def accountinfo_detail_html(request, uid):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        type = request.POST['type']
        if type == '1':
            user = User.objects.get(id=uid)
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
            user = User.objects.get(id=uid)
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
            user = User.objects.get(id=uid)
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
            user = User.objects.get(id=uid)
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
            user = User.objects.get(id=uid)
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
                if file_name.lower().startswith(str(uid) + '.'):
                    imgfile = file_name
                    break

            return render_to_response('04_02_accountinfo_detail.html', \
                                        {'users' : user, 'username' : username, 'avail_nums' : available_companynum, \
                                        'departments' : departments, 'positions' : positions , \
                                        'academics' : academics, 'works' : works, 'imgfile' : imgfile} , \
                                        context_instance=RequestContext(request))
        except Exception as e:
            print e
            return HttpResponse("에러가 발생하였습니다.", status=404)

@permission_required('buildingApp.manage_accountinfo', login_url='/login/')
def accountinfo_detail_upload_html(request, uid):
    if request.method == "POST":
        if 'file' in request.FILES:
            file = request.FILES['file']
#            filename = file._name
            filename = str(uid) + '.' + file._name.split('.')[-1]
            UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'static/person_img')

            for file_name in os.listdir(UPLOAD_DIR):
                if file_name.lower().startswith(str(uid) + '.'):
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
            return HttpResponse('<script>alert("사진을 성공적으로 업로드하였습니다.");window.opener.location.href = "/manage/accountinfo/detail/' + str(uid) + '/";window.close();</script>')

    else:
        return render_to_response('04_02_accountinfo_detail_upload.html', \
                                    {} , \
                                    context_instance=RequestContext(request))


@permission_required('buildingApp.manage_right', login_url='/login/')
def right_html(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        user = User.objects.get(id=request.POST['uid'])
        user.user_permissions.clear()
        if request.POST['perm[0]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="building_register"))
        if request.POST['perm[1]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="building_search_building"))
        if request.POST['perm[2]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="building_search_room"))
        if request.POST['perm[3]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="resident_show"))
        if request.POST['perm[4]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="resident_info"))
        if request.POST['perm[5]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="resident_infofile"))
        if request.POST['perm[6]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="lease_show"))
        if request.POST['perm[7]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="lease_input"))
        if request.POST['perm[8]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="lease_payment"))
        if request.POST['perm[9]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="manage_activate"))
        if request.POST['perm[10]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="manage_accountinfo"))
        if request.POST['perm[11]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="manage_right"))
        if request.POST['perm[12]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="manage_setting"))
        if request.POST['perm[13]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="lease_bill"))
        if request.POST['perm[14]'] == 'true':
            user.user_permissions.add(Permission.objects.get(codename="lease_leave"))
        return render(request, 'index.html')
    else:
        users = User.objects.filter(is_superuser=False).exclude(userprofile__status=0)

        PERSON_IMG_DIR = os.path.join(os.path.dirname(__file__), 'static/person_img')
        for user in users:
            user.hasimage = False
            for file_name in os.listdir(PERSON_IMG_DIR):
                if file_name.lower().startswith(str(user.id) + '.'):
                    user.imgfile = file_name
                    user.hasimage = True
                    break

        for user in users:
            user.permcount = 0
            user.perm = []
            user.permstr = ""
            user.perm.append(user.has_perm("buildingApp.building_register"))
            user.perm.append(user.has_perm("buildingApp.building_search_building"))
            user.perm.append(user.has_perm("buildingApp.building_search_room"))
            user.perm.append(user.has_perm("buildingApp.resident_show"))
            user.perm.append(user.has_perm("buildingApp.resident_info"))
            user.perm.append(user.has_perm("buildingApp.resident_infofile"))
            user.perm.append(user.has_perm("buildingApp.lease_show"))
            user.perm.append(user.has_perm("buildingApp.lease_input"))
            user.perm.append(user.has_perm("buildingApp.lease_payment"))
            user.perm.append(user.has_perm("buildingApp.manage_activate"))
            user.perm.append(user.has_perm("buildingApp.manage_accountinfo"))
            user.perm.append(user.has_perm("buildingApp.manage_right"))
            user.perm.append(user.has_perm("buildingApp.manage_setting"))
            user.perm.append(user.has_perm("buildingApp.lease_bill"))
            user.perm.append(user.has_perm("buildingApp.lease_leave"))
            for pe in user.perm:
                if pe:
                    user.permcount = user.permcount + 1
            for i in range(0,3):
                if user.perm[i]:
                    user.permstr = user.permstr + "건물 관리 시스템, "
                    break
            for i in range(3,6):
                if user.perm[i]:
                    user.permstr = user.permstr + "입주자 관리 시스템, "
                    break
            for i in range(6,9):
                if user.perm[i]:
                    user.permstr = user.permstr + "통합 내역 관리 시스템, "
                    break
            for i in range(9,13):
                if user.perm[i]:
                    user.permstr = user.permstr + "관리자 시스템, "
                    break
            for i in range(13,15):
                if user.perm[i]:
                    user.permstr = user.permstr + "통합 내역 관리 시스템, "
                    break
            if len(user.permstr) != 0:
                user.permstr = user.permstr[0:-2] 
        try:
           username = request.user.userprofile.name
        except:
            username = ""
        return render_to_response('04_03_right.html', \
                                    {'users' : users, 'username' : username} , \
                                    context_instance=RequestContext(request))

################### 부서와 직급 설정 ###################
@permission_required('buildingApp.manage_setting', login_url='/login/')
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

@permission_required('buildingApp.manage_setting', login_url='/login/')
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

@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_companynumber_html(request):
    if request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        new_min_number = int(request.POST['min_number'])
        new_max_number = int(request.POST['max_number'])
        if new_min_number < 0:
            return HttpResponse("사번은 양수여야 합니다.", status=404)
        if new_min_number > new_max_number:
            return HttpResponse("최대값이 최소값보다 커야합니다.", status=404)
        min_setting = SystemSettings.objects.get(name="companynum_min")
        min_setting.value = new_min_number
        min_setting.save()
        max_setting = SystemSettings.objects.get(name="companynum_max")
        max_setting.value = new_max_number
        max_setting.save()
        return render(request, 'index.html')
    else:
        try:
            min_number = int(SystemSettings.objects.get(name="companynum_min").value)
        except:
            min_setting = SystemSettings()
            min_setting.name = "companynum_min"
            min_setting.value = "1"
            min_setting.save()
            min_number = 1
        try:
            max_number = int(SystemSettings.objects.get(name="companynum_max").value)
        except:
            max_setting = SystemSettings()
            max_setting.name = "companynum_max"
            max_setting.value = "100"
            max_setting.save()
            max_number = 100
        return render_to_response('04_04_setting_companynum.html', \
                                    {'min_number' : min_number, 'max_number' : max_number} , \
                                    context_instance=RequestContext(request))
            


@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_adjustment_html(request):
	bi = BuildingInfo.objects.all().order_by('number')
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
			all_sp_id.append( int(s.id) )
			all_sp_mt.append( int(s.month) )
			all_sp_dr.append( float(s.delayRate) )
		buildingList.append( {'id' : int(b.id), 'name' : str(b.name), 'months' : months, 'cnt' : int(cnt)} )

	param = {}
	param['numOfBuilding'] = len(buildingList)
	param['buildingList'] = buildingList
	param['sp_id'] = json.dumps(all_sp_id)
	param['sp_month'] = json.dumps(all_sp_mt)
	param['sp_delayRate'] = json.dumps(all_sp_dr)
	return render_to_response('04_04_setting_adjustment.html', param, context_instance=RequestContext(request))

@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_adjustment_confirm(request):
	if request.method == 'POST':
		bid = int(request.POST['bid'])
		spid = request.POST.getlist('spid[]')
		spmt = request.POST.getlist('spmt[]')
		spdr = request.POST.getlist('spdr[]')

		objs_new = []
		objs_chg = []
		objs_del = []
		for i in range(len(spid)):
			if int(spid[i]) == 0: # 새로 추가
				sp = SettingPayment()
				sp.building = BuildingInfo.objects.get(id = int(bid))
				sp.month = int(spmt[i])
				sp.delayRate = float(spdr[i])
				objs_new.append(sp)
			elif int(spid[i]) > -10000000 and int(spid[i]) < 0: # 삭제
				sp = SettingPayment.objects.get(id = -int(spid[i]))
				objs_del.append(sp)
			else: # 변경
				sp = None
				try:
					sp = SettingPayment.objects.get(building_id = int(bid), id = int(spid[i]))
				except:
					pass
				if sp != None:
					sp.month = int(spmt[i])
					sp.delayRate = float(spdr[i])
					objs_chg.append(sp)

		for o in objs_new:
			o.save()
		for o in objs_chg:
			o.save()
		for o in objs_del:
			o.delete()

		return HttpResponse('OK')
	return HttpResponse('NOT POST')



@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_bill_html(request):
	param = {}
	si = SettingBill.objects.all()
	buildingList = []
	bi = BuildingInfo.objects.all().order_by('number')
	for b in bi:
		buildingList.append( {'id' : int(b.id), 'name' : str(b.name)} )
	param['buildingList'] = buildingList

	return render_to_response('04_04_setting_bill.html', param, context_instance=RequestContext(request))


@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_bill_create(request):
	if request.method == 'POST':
		bid = int(request.POST['bid'])
		type = str(request.POST['type'])
		smonth = request.POST.getlist('smonth[]')
		sdate = request.POST.getlist('sdate[]')
		edate = request.POST.getlist('edate[]')
		ndate = request.POST.getlist('ndate[]')

		for i in range(len(smonth)):
			sb = SettingBill()
			sb.building = BuildingInfo.objects.get(id = int(bid))
			sb.type = type
			sb.month = int(smonth[i])
			sb.startDate = str(sdate[i].replace('.','-'))
			sb.endDate = str(edate[i].replace('.','-'))
			sb.noticeDate = str(ndate[i].replace('.','-'))
			sb.save()

		return HttpResponse('OK')
	return HttpResponse('NOT POST')

@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_bill_get_contents(request):
	if request.method == 'POST':
		sb = SettingBill.objects.all().values('building', 'type').distinct()
		sb2 = SettingBill.objects.all().order_by('building', 'type', 'month')
		return toJSON(serialize_setting_bill(sb, sb2))
	return HttpResponse('NOT POST')

def serialize_setting_bill(sb, sb2):
    serial_sb = []
    serial_data = []
    for s in sb:
        data = {}
        data['bid'] = int(s['building'])
        data['bname'] = str( BuildingInfo.objects.get(id = int(data['bid'])).name )
        data['type'] = str(s['type'])
        this_sb = SettingBill.objects.filter(building_id = data['bid'], type = data['type'])
        data['cnt'] = len(this_sb)
        data['month_unit'] = int(1)
        if len(this_sb) > 1:
            data['month_unit'] = int(this_sb[1].month) - int(this_sb[0].month)
        serial_sb.append(data)
    for s in sb2:
        data = {}
        data['bid'] = int(s.building_id)
        data['type'] = str(s.type)
        data['month'] = int(s.month)
        data['startDate'] = str(s.startDate).replace('-','.')
        data['endDate'] = str(s.endDate).replace('-','.')
        data['noticeDate'] = str(s.noticeDate).replace('-','.')
        serial_data.append(data)
    return [serial_sb, serial_data]

def toJSON(objs, status=200):
    j = json.dumps(objs, ensure_ascii=False)
    return HttpResponse(j, status=status, content_type='application/json; charset=utf-8')

@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_bill_modify(request):
	if request.method == 'POST':
		bid = int(request.POST['bid'])
		typ = str(request.POST['type'])
		smonth = request.POST.getlist('smonth_modify[]')
		sdate = request.POST.getlist('sdate_modify[]')
		edate = request.POST.getlist('edate_modify[]')
		ndate = request.POST.getlist('ndate_modify[]')

		saveData = []
		for i in range(len(smonth)):
			sb = SettingBill.objects.get(building_id = int(bid), type = str(typ), month = int(smonth[i]))
			sb.startDate = str(sdate[i].replace('.','-'))
			sb.endDate = str(edate[i].replace('.','-'))
			sb.noticeDate = str(ndate[i].replace('.','-'))
			saveData.append(sb)
		for s in saveData:
			s.save()

		return HttpResponse('OK')
	return HttpResponse('NOT POST')

@permission_required('buildingApp.manage_setting', login_url='/login/')
def setting_bill_delete_data(request):
	if request.method == 'POST':
		bid = int(request.POST['bid'])
		typ = str(request.POST['type'])
		SettingBill.objects.filter(building_id = bid, type = typ).delete()
		return HttpResponse('OK') 
	return HttpResponse('NOT POST')



