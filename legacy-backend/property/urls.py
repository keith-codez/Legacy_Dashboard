# property/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register(r'tenants', TenantViewSet, basename="tenant")
router.register(r'units', UnitViewSet, basename="unit")
router.register(r'leases', LeaseViewSet, basename="lease")
router.register(r'invoices', InvoiceViewSet, basename="invoice")
router.register(r'payments', PaymentViewSet, basename="payment")
router.register(r'allocations', PaymentAllocationViewSet, basename="allocation")
router.register(r'interactions', InteractionViewSet, basename="interaction")

urlpatterns = [
    path('', include(router.urls)),

    # Custom endpoints
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]