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






