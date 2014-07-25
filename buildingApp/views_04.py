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

def activate_html(request):
    return render(request, '04_01_activate.html')

def accountinfo_html(request):
    return render(request, '04_02_accountinfo.html')
