from django.conf.urls import patterns, include, url
from buildingApp.views import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^main/$', main_html),
    url(r'^resident/info/$', resident_info_html),
    url(r'^resident/show/(?P<uid>\d+)/$', show_detail_resident_info),
    url(r'^resident/show/$', resident_show_html),
    url(r'^resident/save/$', save_resident_info),
    url(r'^resident/search/$', show_resident_info),
)
