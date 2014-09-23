# -*- coding: utf-8 -*-

#from django_cron import cronScheduler, Job
from django_cron import CronJobBase, Schedule
import datetime

from buildingApp.views_03 import *
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
from django.contrib.auth.decorators import permission_required


#class CheckPaymentDelay(Job):
class CheckPaymentDelay(CronJobBase):
    # run every X seconds
    #run_every = 1
    
    RUN_EVERY_MINS = 1 # every 1 minute

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'buildingApp.cron_test' # a unique code


    # 매일 23시 58분에 이 함수가 실행된다.
    # 기능 : 납부 내역을 모두 검사하여, 매달 입금일 날짜가 되면 미납된 부분에 대해 알맞은 연체율을 통해 연체료를 부과한다.
    def do(self):
        # 지정된 건물의 n회차 누적되었을 때의 연체율을 구한다.
        # n회차에 대한 내용은 없지만, 최대치가 있을 경우, 그 값을 반환한다.
        # 데이터가 없을 경우 0을 반환한다.
        def getDelayRate(sp, number):
            maxVal = -1.0
            for s in sp:
                if int(s.month) == int(number):
                    return float(s.delayRate)
                if int(s.month) == int(13):
                    maxVal = float(s.delayRate)
            if maxVal != -1.0:
                return maxVal
            return float(0)

        today = int( datetime.datetime.now().day )
        building = BuildingInfo.objects.all()
        for b in building:
            sp = SettingPayment.objects.filter(building = b)
            payments = PaymentInfo.objects.filter(building = b).order_by('resident', 'year', 'month', '-id')
            for i in range(len(payments)):
                if (i > 0 and int(payments[i].resident_id) == int(payments[i-1].resident_id) and int(payments[i].year) == int(payments[i-1].year) and int(payments[i].month) == int(payments[i-1].month)) or int(payments[i].payStatus) == -1:
                    continue
                day = int( ResidentInfo.objects.get(id = int(payments[i].resident_id)).leasePayDate )
                print(today, day, int(payments[i].year), int(payments[i].month))
                if today == day: # 오늘 날짜와 납부예정일 날짜가 같을 때, 오늘 23시 58분에 연체료를 부과한다.
                    payments[i].accumNumber += 1
                    payments[i].amountNoPay += int( float(payments[i].amountNoPay) * float(getDelayRate(sp, payments[i].accumNumber)) * float(0.010) )
                    payments[i].save()


#cronScheduler.register(CheckPaymentDelay)
