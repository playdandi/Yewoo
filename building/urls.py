from django.conf.urls import patterns, include, url
from django.core.urlresolvers import reverse_lazy
from django.views.generic import RedirectView
from buildingApp.views_01 import *
from buildingApp.views_02 import *
from buildingApp.views_03 import *
from buildingApp.views_03_05 import *
from buildingApp.views_04 import *
from buildingApp.views_account import *
from buildingApp.views_leave import *



# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

# django-cron job
#import django_cron
#django_cron.autodiscover()

urlpatterns = patterns('',
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^$', RedirectView.as_view(url='/login/')),

    url(r'^account/signup/$', signup),
    url(r'^account/checkid/$', checkid),
    url(r'^login/$', login_request), 
    url(r'^logout/$', logout_request), 
    url(r'^myprofile/$', myprofile_html), 
    url(r'^myprofile/upload/$', myprofile_upload_html), 

#    url(r'^main/$', main_html),
    url(r'^newmain/$', newmain_html),
    url(r'^building/register/$', building_register_html),
    url(r'^building/getrooms/$', building_get_rooms),
    url(r'^building/save/$', building_save),
    url(r'^building/search/building/$', building_search_building_html),
    url(r'^building/search/$', building_search),
    url(r'^building/contents/(?P<uid>\d+)/$', building_show_contents_html),
    url(r'^building/update/(?P<uid>\d+)/$', building_update),
    url(r'^building/search/rooms/$', building_search_rooms_html),

    url(r'^resident/info/$', resident_info_html),
    url(r'^resident/infoFile/$', resident_infoFile_html),
    url(r'^resident/getAllResidentInfo/$', get_all_residentInfo_bname_roomnum),
    url(r'^resident/show/(?P<uid>\d+)/$', show_detail_resident_info),
    url(r'^resident/show/$', resident_show_html),
    url(r'^resident/modify/(?P<rid>\d+)/$', show_modify_resident_info),
    url(r'^resident/save/$', save_resident_info),
    url(r'^resident/saveByFile/$', save_resident_info_by_file),
    url(r'^resident/search/$', show_resident_info),

    url(r'^lease/show/lease/$', lease_show_html),
    url(r'^lease/show/notice/$', notice_show_html),
    url(r'^lease/show/leaseNotice/(?P<bid>\d+)/(?P<rid>\d+)/(?P<tab>\d+)/$', lease_notice_detail_show_html),
    url(r'^lease/show/detail/getAllInfo/$', lease_notice_detail_getAllInfo),
    url(r'^lease/show/payment/$', payment_show_html),
    url(r'^lease/show/electricity/$', electricity_show_html),
    url(r'^lease/show/gas/$', gas_show_html),
    url(r'^lease/show/water/$', water_show_html),
    url(r'^lease/input/upload/$', excel_file_upload),
    url(r'^lease/input/delete/$', excel_file_delete),
    url(r'^lease/input/check/$', check_input_html),
    url(r'^lease/input/saveInputCheck/$', save_input),
    url(r'^lease/input/saveNoticeCheck/$', save_notice),
    url(r'^lease/input/notice/$', notice_input_html),
    url(r'^lease/input/notice/detail/save/$', notice_detail_save),
    url(r'^lease/input/notice/detail/(?P<bid>\d+)/(?P<rid>\d+)/(?P<eid>\d+)/(?P<year>\d+)/(?P<month>\d+)/(?P<tab>\d+)/$', notice_detail_input_html),
    url(r'^lease/input/notice/detail/getInfoTab2/$', notice_detail_tab2),
    url(r'^lease/input/notice/detail/detailInfo/$', notice_detail_tab2_detail),
    url(r'^lease/input/electricity/$', electricity_input_html),
    url(r'^lease/input/gas/$', gas_input_html),
    url(r'^lease/input/water/$', water_input_html),
    url(r'^lease/input/getEGWInfo/$', get_egw_info),
    url(r'^lease/input/getLeaseInfo/$', get_lease_info),
    url(r'^lease/input/getNoticeInfo/$', get_notice_info),

    url(r'^lease/payment/$', payment_input_html),
    url(r'^lease/payment/getInfo/$', payment_input_getinfo),
    url(r'^lease/payment/savePaymentCheck/$', payment_check),
    url(r'^lease/payment/detail/(?P<bid>\d+)/(?P<rid>\d+)/(?P<year>\d+)/(?P<month>\d+)/(?P<tab>\d+)/$', payment_detail_html),
    url(r'^lease/payment/detail/getAllInfo/$', payment_detail_allInfo),
    url(r'^lease/payment/detail/getInfoTab2/$', payment_detail_info_tab2),
    #url(r'^lease/payment/detail/getModifyInfo/$', payment_detail_modifyinfo),
    url(r'^lease/payment/detail/saveInput/$', payment_detail_saveInput),
    url(r'^lease/payment/detail/saveModify/$', payment_detail_saveModify),

    url(r'^lease/leave/$', leave_html),
    url(r'^lease/leave/down_owner/(?P<uid>\d+)/$', leave_down_owner),
    url(r'^lease/leave/down_tenant/(?P<uid>\d+)/$', leave_down_tenant),
    url(r'^lease/leave/owner/(?P<uid>\d+)/$', leave_owner_html),
    url(r'^lease/leave/owner/get/(?P<rid>\d+)/$', get_leaveowner),
    url(r'^lease/leave/owner/save/(?P<rid>\d+)/$', save_leaveowner),
    url(r'^lease/leave/owner_print/(?P<uid>\d+)/$', leave_owner_print_html),
    url(r'^lease/leave/confirm_owner_print/(?P<uid>\d+)/$', leave_confirm_owner_print_html),
    url(r'^lease/leave/tenant/(?P<uid>\d+)/$', leave_tenant_html),
    url(r'^lease/leave/tenant_print/(?P<uid>\d+)/$', leave_tenant_print_html),
    url(r'^lease/leave/confirm_tenant_print/(?P<uid>\d+)/$', leave_confirm_tenant_print_html),
    url(r'^lease/leave/confirm/(?P<uid>\d+)/$', leave_confirm_html),
    url(r'^lease/leave/final/(?P<uid>\d+)/$', leave_final_html),

    url(r'^lease/bill/$', bill_show_html),
    url(r'^lease/bill/total/(?P<bid>\d+)/input/(?P<year>\d+)/(?P<month>\d+)/$', bill_total_input_html),
    url(r'^lease/bill/total/(?P<bid>\d+)/look/(?P<year>\d+)/(?P<month>\d+)/(?P<searchYear>\d+)/$', bill_total_look_html),
    url(r'^lease/bill/total/(?P<bid>\d+)/manage/(?P<year>\d+)/(?P<month>\d+)/(?P<searchYear>\d+)/$', bill_total_manage_html),
	url(r'^lease/bill/total/input/confirm/$', bill_total_input_confirm),
	url(r'^lease/bill/total/manage/confirm/$', bill_total_manage_confirm),
    
	url(r'^lease/bill/each/(?P<bid>\d+)/(?P<roomid>\d+)/input/(?P<year>\d+)/(?P<month>\d+)/$', bill_each_input_html),
    url(r'^lease/bill/each/(?P<bid>\d+)/(?P<roomid>\d+)/look/(?P<year>\d+)/(?P<month>\d+)/(?P<searchYear>\d+)/$', bill_each_look_html),
    url(r'^lease/bill/each/(?P<bid>\d+)/(?P<roomid>\d+)/manage/(?P<year>\d+)/(?P<month>\d+)/(?P<searchYear>\d+)/$', bill_each_manage_html),
	url(r'^lease/bill/each/input/confirm/$', bill_each_input_confirm),
	url(r'^lease/bill/each/manage/confirm/$', bill_each_manage_confirm),
    url(r'^lease/bill/each/print/(?P<roomid>\d+)/$', bill_each_print_html),


    url(r'^manage/activate/$', activate_html), 
    url(r'^manage/accountinfo/$', accountinfo_html), 
    url(r'^manage/accountinfo/detail/(?P<uid>\d+)/$', accountinfo_detail_html), 
    url(r'^manage/accountinfo/detail/upload/(?P<uid>\d+)/$', accountinfo_detail_upload_html), 
    url(r'^manage/right/$', right_html), 
    url(r'^manage/setting/department/$', setting_department_html), 
    url(r'^manage/setting/position/$', setting_position_html), 
    url(r'^manage/setting/companynum/$', setting_companynumber_html), 
    url(r'^manage/setting/adjustment/$', setting_adjustment_html),
    url(r'^manage/setting/adjustment/confirm/$', setting_adjustment_confirm),
    url(r'^manage/setting/bill/$', setting_bill_html),
    url(r'^manage/setting/bill/create/$', setting_bill_create),
    url(r'^manage/setting/bill/getContents/$', setting_bill_get_contents),
    url(r'^manage/setting/bill/modify/$', setting_bill_modify),
    url(r'^manage/setting/bill/deleteData/$', setting_bill_delete_data),
)
