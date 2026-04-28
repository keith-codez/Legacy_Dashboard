# core/urls.py

from django.contrib import admin
from django.urls import path, include



urlpatterns = [
    path('admin/', admin.site.urls),

    # Delegate ALL API routing to property app
    path('api/', include('property.urls')),

]