from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.middleware.csrf import get_token
from buildingApp.models import *

def main_html(request):
    return render_to_response('index.html')

def resident_info_html(request):
    csrf_token = get_token(request)
    return render(request, '02_01_resident_info.html', {'range' : range(1, 32)})

def save_resident_info(request):
    if request.method == "GET":
        print('get')
    elif request.method == "POST":
        param = {}
        for name in request.POST:
            param[name] = request.POST.get(name, '').strip()

        resident = ResidentInfo()

        resident.buildingName = param['buildingName']
        resident.buildingRoomNumber = param['buildingRoomNumber']
        resident.inDate = param['inDate'].replace('.', '-')
        resident.outDate = param['outDate'].replace('.', '-')
        resident.leaseType = param['leaseType']
        resident.leaseDeposit = param['leaseDeposit']
        resident.leasePayWay = param['leasePayWay']
        resident.leasePayDate = param['leasePayDate']
        resident.leaseMoney = param['leaseMoney']
        resident.agency = param['agency']
        resident.agencyName = param['agencyName']
        resident.checkE = param['checkE']
        resident.checkG = param['checkG']
        resident.checkW = param['checkW']

        resident.contractorName = param['contractorName']
        resident.contractorGender = param['contractorGender']
        resident.contractorRegNumber = param['contractorRegNumber']
        resident.contractorContactNumber1 = param['contractorContactNumber1']
        if param['contractorContactNumber2'] != '--':
            resident.contractorContactNumber2 = param['contractorContactNumber2']
        resident.contractorAddress = param['contractorAddress']

        resident.residentName = param['residentName']
        resident.residentGender = param['residentGender']
        resident.residentRegNumber = param['residentRegNumber']
        resident.relToContractor = param['relToContractor']
        resident.residentPeopleNumber = param['residentPeopleNumber']
        resident.residentContactNumber1 = param['residentContactNumber1']
        if param['residentContactNumber2'] != '--':
            resident.residentContactNumber2 = param['residentContactNumber2']
        if param['residentOfficeName'] != '':
            resident.residentOfficeName = param['residentOfficeName']
        if param['residentOfficeLevel'] != '':
            resident.residentOfficeLevel = param['residentOfficeLevel']
        if param['residentOfficeAddress'] != '':
            resident.residentOfficeAddress = param['residentOfficeAddress']
        if param['residentOfficeContactNumber'] != '--':
            resident.residentOfficeContactNumber = param['residentOfficeContactNumber']
        resident.residentEmail = param['residentEmail']

        resident.haveCar = param['haveCar']
        if resident.haveCar == 'y':
            resident.carNumber = param['carNumber']
            resident.parkingFee = param['parkingFee']
        #else:
        #    resident.carNumber = ''
        #    resident.parkingFee = 0
        resident.sendMsg = param['sendMsg']
        resident.checkin = param['checkin']
        resident.checkout = param['checkout']
        resident.memo = param['memo']

        resident.save()
        print('saved')
            
    else:
        print("ha...")

    return render_to_response('index.html')

