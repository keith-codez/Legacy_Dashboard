from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from property.views import *

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'units', UnitViewSet)
router.register(r'leases', LeaseViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'allocations', PaymentAllocationViewSet)
router.register(r'interactions', InteractionViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]