from rest_framework import serializers
from .models import *
from property.services.allocation_service import (
    get_invoice_allocated,
    get_tenant_balance
)


class TenantSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = "__all__"

    def get_status(self, obj):
        return "Active" if Lease.objects.filter(
            tenant=obj, status="Active"
        ).exists() else "Inactive"

    def get_balance(self, obj):
        return float(get_tenant_balance(obj))


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'


class LeaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lease
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    tenant_name = serializers.CharField(source="tenant.company_name", read_only=True)

    invoice_no = serializers.CharField(read_only=True)  # IMPORTANT

    class Meta:
        model = Invoice
        fields = "__all__"

    def get_balance(self, obj):
        allocated = get_invoice_allocated(obj)
        balance = float(obj.total_amount) - float(allocated)
        return max(balance, 0)

    def get_status(self, obj):
        allocated = get_invoice_allocated(obj)

        if allocated >= obj.total_amount:
            return "Paid"
        elif allocated > 0:
            return "Partially Paid"
        return "Unpaid"

class PaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(
        source="tenant.company_name",
        read_only=True
    )

    class Meta:
        model = Payment
        fields = '__all__'


class PaymentAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAllocation
        fields = '__all__'


class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = '__all__'