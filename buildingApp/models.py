from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User)

class ResidentInfo(models.Model):
    buildingName = models.IntegerField()
    buildingRoomNumber = models.IntegerField()
    inDate = models.DateField()
    outDate = models.DateField()
    leaseType = models.CharField(max_length=4)
    leaseDeposit = models.IntegerField()
    leasePayWay = models.CharField(max_length=4)
    leasePayDate = models.IntegerField()
    leaseMoney = models.IntegerField()
    agency = models.CharField(max_length=10)
    agencyName = models.CharField(max_length=20)
    checkType = models.IntegerField()
    checkE = models.IntegerField()
    checkG = models.IntegerField(null=True)
    checkW = models.IntegerField(null=True)
    checkHWG = models.IntegerField(null=True)
    checkHG = models.IntegerField(null=True)
    checkHWW = models.IntegerField(null=True)
    checkHW = models.IntegerField(null=True)

    contractorName = models.CharField(max_length=10)
    contractorGender = models.CharField(max_length=1)
    contractorRegNumber = models.CharField(max_length=14)
    contractorContactNumber1 = models.CharField(max_length=13)
    contractorContactNumber2 = models.CharField(max_length=13, blank=True)
    contractorAddress = models.CharField(max_length=150)
    
    residentName = models.CharField(max_length=10)
    residentGender = models.CharField(max_length=1)
    residentRegNumber = models.CharField(max_length=14)
    relToContractor = models.CharField(max_length=10)
    residentPeopleNumber = models.IntegerField()
    residentAddress = models.CharField(max_length=150)
    residentContactNumber1 = models.CharField(max_length=13)
    residentContactNumber2 = models.CharField(max_length=13, blank=True)
    residentOfficeName = models.CharField(max_length=20, blank=True)
    residentOfficeLevel = models.CharField(max_length=10, blank=True)
    residentOfficeAddress = models.CharField(max_length=100, blank=True)
    residentOfficeContactNumber = models.CharField(max_length=13, blank=True)
    residentEmail = models.EmailField(max_length=40)
    haveCar = models.CharField(max_length=1)
    carNumber = models.CharField(max_length=15, blank=True)
    parkingFee = models.IntegerField(null=True, blank=True)

    sendMsg = models.CharField(max_length=1)
    checkin = models.CharField(max_length=1)
    checkout = models.CharField(max_length=1)
    checkoutWhy = models.CharField(max_length=200, null=True, blank=True)
    checkoutDate = models.DateField(null=True)

    memo = models.TextField(blank=True)

    #def __unicode__(self):
    #    return self.str

    #def __str__(self):
    #    return unicode(self).encode('utf-8')



class BuildingInfo(models.Model):
    number = models.IntegerField(unique=True)
    name = models.CharField(max_length=30)
    type = models.IntegerField()
    remote = models.IntegerField()
    address = models.CharField(max_length=300)
    manager = models.CharField(max_length=14)
    floorFrom = models.IntegerField()
    floorTo = models.IntegerField()
    numRoom = models.IntegerField()
    numStore = models.IntegerField()
    numParking = models.IntegerField()

class BuildingFloor(models.Model):
    building = models.ForeignKey('BuildingInfo')
    floor = models.IntegerField()
    roomNum = models.IntegerField()
    hasStore = models.CharField(max_length=1, blank=True, null=True)
    storeNum = models.IntegerField(blank=True, null=True)
    storeNames = models.CharField(max_length=300, blank=True, null=True)
    hasParking = models.CharField(max_length=1)
    parkingNum = models.IntegerField(blank=True, null=True)


class ExcelFiles(models.Model):
    type = models.CharField(max_length=11)
    building = models.ForeignKey('BuildingInfo')
    year = models.IntegerField()
    month = models.IntegerField()
    filename = models.CharField(max_length=150)
    uploadDate = models.DateField()

class ElectricityInfo(models.Model):
    resident = models.ForeignKey('ResidentInfo')
    building = models.ForeignKey('BuildingInfo')
    year = models.IntegerField()
    month = models.IntegerField()
    usePeriod = models.IntegerField()
    readBefore = models.IntegerField()
    readNow = models.IntegerField()
    capacityBefore = models.IntegerField()
    capacityNow = models.IntegerField()
    basicCharge = models.IntegerField()
    useCharge = models.IntegerField()
    vat = models.IntegerField()
    fundE = models.IntegerField()
    tvLicenseFee = models.IntegerField()
    trimmedFee = models.IntegerField()
    totalFee = models.IntegerField()

class GasInfo(models.Model):
    resident = models.ForeignKey('ResidentInfo')
    building = models.ForeignKey('BuildingInfo')
    year = models.IntegerField()
    month = models.IntegerField()
    usePeriod = models.IntegerField()
    readBefore = models.IntegerField(null=True, blank=True)
    readNow = models.IntegerField(null=True, blank=True)
    capacityBefore = models.IntegerField(null=True, blank=True)
    capacityNow = models.IntegerField(null=True, blank=True)
    readBeforeHotWater = models.IntegerField(null=True, blank=True) # bela 1,2,3
    readBeforeHeat = models.IntegerField(null=True, blank=True) # bela 1,2,3
    readNowHotWater = models.IntegerField(null=True, blank=True) # bela 1,2,3
    readNowHeat = models.IntegerField(null=True, blank=True) # bela 1,2,3
    capacityBeforeHotWater = models.IntegerField(null=True, blank=True) # bela 1,2,3
    capacityBeforeHeat = models.IntegerField(null=True, blank=True) # bela 1,2,3
    capacityNowHotWater = models.IntegerField(null=True, blank=True) # bela 1,2,3
    capacityNowHeat = models.IntegerField(null = True, blank=True) # bela 1,2,3
    basicCharge = models.IntegerField() 
    useCharge = models.IntegerField()
    vat = models.IntegerField()
    trimmedFee = models.IntegerField()
    totalFee = models.IntegerField()

class WaterInfo(models.Model):
    resident = models.ForeignKey('ResidentInfo')
    building = models.ForeignKey('BuildingInfo')
    year = models.IntegerField()
    month = models.IntegerField()
    usePeriod = models.IntegerField()
    readBefore = models.IntegerField()
    readNow = models.IntegerField()
    capacityBefore = models.IntegerField()
    capacityNow = models.IntegerField()
    basicCharge = models.IntegerField()
    waterSupplyCharge = models.IntegerField()
    sewerageCharge = models.IntegerField()
    waterUseCharge = models.IntegerField()
    trimmedFee = models.IntegerField()
    totalFee = models.IntegerField()


class PaymentInfo(models.Model):
    resident = models.ForeignKey('ResidentInfo')
    building = models.ForeignKey('BuildingInfo')
    checked = models.BooleanField()
    year = models.IntegerField()
    month = models.IntegerField()
    number = models.IntegerField()
    totalFee = models.IntegerField()
    amountPaySum = models.IntegerField()
    amountPay = models.IntegerField()
    amountNoPay = models.IntegerField()
    payDate = models.DateField(null=True)
    confirmDate = models.DateField(null=True)
    confirmStatus = models.CharField(max_length=1)
    payStatus = models.IntegerField()
    delayNumberNow = models.IntegerField()
    delayNumberNext = models.IntegerField()
    payMsg = models.TextField()
    modifyNumber = models.IntegerField()
    class Meta:
        unique_together = ('resident', 'building', 'year', 'month', 'payStatus')

class PaymentModifyInfo(models.Model):
    payment = models.ForeignKey('PaymentInfo')
    modifyNumber = models.IntegerField()
    year = models.IntegerField()
    month = models.IntegerField()
    payStatus = models.IntegerField()
    payDate = models.DateField(null=True)
    delayNumberNow = models.IntegerField()
    delayNumberNext = models.IntegerField()
    amountPaySum = models.IntegerField()
    amountPay = models.IntegerField()
    amountNoPay = models.IntegerField()
    confirmDate = models.DateField(null=True)
    modifyTime = models.DateField(null=True)
    modifyMsg = models.TextField()
    class Meta:
        unique_together = ('payment', 'modifyNumber')










