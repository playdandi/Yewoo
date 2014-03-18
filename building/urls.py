from django.conf.urls import patterns, include, url
from buildingApp.views_01 import *
from buildingApp.views_02 import *
from buildingApp.views_03 import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^main/$', main_html),
    url(r'^building/register/$', building_register_html),
    url(r'^building/getrooms/$', building_get_rooms),
    url(r'^building/save/$', building_save),
    url(r'^building/search/building/$', building_search_building_html),
    url(r'^building/search/$', building_search),
    url(r'^building/contents/(?P<uid>\d+)/$', building_show_contents_html),
    url(r'^building/update/(?P<uid>\d+)/$', building_update),
    url(r'^building/search/rooms/$', building_search_rooms_html),

    url(r'^resident/info/$', resident_info_html),
    url(r'^resident/show/(?P<uid>\d+)/$', show_detail_resident_info),
    url(r'^resident/show/$', resident_show_html),
    url(r'^resident/save/$', save_resident_info),
    url(r'^resident/search/$', show_resident_info),

    url(r'^lease/show/lease/$', lease_show_html),
    url(r'^lease/show/notice/$', notice_show_html),
    url(r'^lease/show/leaseNotice/(?P<bid>\d+)/(?P<rnum>\d+)/$', lease_notice_detail_show_html),
    url(r'^lease/show/payment/$', payment_show_html),
    url(r'^lease/show/electricity/$', electricity_show_html),
    url(r'^lease/show/gas/$', gas_show_html),
    url(r'^lease/show/water/$', water_show_html),
    url(r'^lease/input/upload/$', excel_file_upload),
    url(r'^lease/input/delete/$', excel_file_delete),
    url(r'^lease/input/check/$', check_input_html),
    url(r'^lease/input/notice/$', notice_input_html),
    url(r'^lease/input/notice/detail/$', notice_detail_input_html),
    url(r'^lease/input/electricity/$', electricity_input_html),
    url(r'^lease/input/gas/$', gas_input_html),
    url(r'^lease/input/water/$', water_input_html),
    url(r'^lease/input/getEGWInfo/$', get_egw_info),

    url(r'^lease/payment/$', payment_input_html),
    url(r'^lease/payment/detail/(?P<bid>\d+)/(?P<rid>\d+)/$', payment_detail_html),
    #url(r'^lease/payment/getInfo/$', payment_detail_getinfo),
)
