from django.db.models import Sum
from property.models import PaymentAllocation, Invoice


def get_invoice_allocated(invoice):
    return PaymentAllocation.objects.filter(
        invoice=invoice
    ).aggregate(total=Sum("allocation_amount"))["total"] or 0


def get_invoice_balance(invoice):
    allocated = get_invoice_allocated(invoice)
    return float(invoice.total_amount) - float(allocated)


def get_tenant_allocated(tenant):
    return PaymentAllocation.objects.filter(
        invoice__tenant=tenant
    ).aggregate(total=Sum("allocation_amount"))["total"] or 0


def get_tenant_invoiced(tenant):
    return Invoice.objects.filter(
        tenant=tenant
    ).aggregate(total=Sum("total_amount"))["total"] or 0


def get_tenant_balance(tenant):
    return float(get_tenant_invoiced(tenant)) - float(get_tenant_allocated(tenant))