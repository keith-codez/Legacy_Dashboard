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
    status = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = "__all__"
        read_only_fields = ["status"]

    def get_status(self, obj):
        return "Occupied" if obj.lease_set.filter(status="Active").exists() else "Vacant"

    def validate_unit_no(self, value):
        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError("unit_no is required")

        return value
    
class LeaseSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.company_name", read_only=True)

    unit_no = serializers.CharField(source="unit.unit_no", read_only=True)
    unit_type = serializers.CharField(source="unit.unit_type", read_only=True)
    base_rent = serializers.DecimalField(
        source="unit.base_rent",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Lease
        fields = "__all__"
        read_only_fields = ("lease_number",)

class InvoiceSerializer(serializers.ModelSerializer):
    paid_amount = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    tenant_name = serializers.CharField(source="tenant.company_name", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"

    def _paid(self, obj):
        # works for BOTH annotated and non-annotated instances
        return getattr(obj, "paid_amount_db", None) or 0

    def get_paid_amount(self, obj):
        return float(self._paid(obj))

    def get_balance(self, obj):
        paid = float(self._paid(obj))
        return max(float(obj.total_amount) - paid, 0)

    def get_status(self, obj):
        paid = float(self._paid(obj))

        if paid >= float(obj.total_amount):
            return "Paid"
        elif paid > 0:
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
    payment_no = serializers.CharField(source="payment.payment_no", read_only=True)
    payment_date = serializers.DateField(source="payment.date", read_only=True)
    method = serializers.CharField(source="payment.method", read_only=True)

    class Meta:
        model = PaymentAllocation
        fields = "__all__"

class InteractionSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.company_name", read_only=True)

    class Meta:
        model = Interaction
        fields = "__all__"