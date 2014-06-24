#from django_cron import cronScheduler, Job
from django_cron import CronJobBase, Schedule
import datetime

#def test():
#    # This will be executed every x seconds
#    today = datetime.datetime.now()
#    print(str(today.year)+'.'+str(today.month)+'.'+str(today.day))
    

#class CheckPaymentDelay(Job):
class CheckPaymentDelay(CronJobBase):
    # run every X seconds
    #run_every = 1
    
    RUN_EVERY_MINS = 1 # every 1 minute

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'buildingApp.cron_test' # a unique code

    def do(self):
        today = datetime.datetime.now()
        print(str(today.year)+'.'+str(today.month)+'.'+str(today.day))
    '''
    def job(self):
        # This will be executed every x seconds
        today = datetime.datetime.now()
        print(str(today.year)+'.'+str(today.month)+'.'+str(today.day))
    '''

#cronScheduler.register(CheckPaymentDelay)
