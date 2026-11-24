import os
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

_admin_path = os.environ.get('ADMIN_URL', 'wilmark-manage-2025/')

urlpatterns = [path(_admin_path, admin.site.urls), path("api/", include("community.urls")),
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT})]
