from django.db import transaction
from decimal import Decimal
from django.db.models import Sum

from property.models import Payment, Invoice, PaymentAllocation, Tenant
from property.services.allocation_service import get_invoice_allocated


@transaction.atomic
def create_payment_with_allocations(data):
    allocations = data.pop("allocations", [])
    tenant_id = data.pop("tenant", None)

    if not tenant_id:
        raise Exception("Tenant is required")

    tenant = Tenant.objects.get(id=tenant_id)

    payment = Payment.objects.create(
        tenant=tenant,
        **data
    )

    total_allocated = Decimal("0.00")

    for alloc in allocations:
        invoice_id = alloc.get("invoice_id")
        amount = Decimal(str(alloc.get("amount", 0)))

        if not invoice_id or amount <= 0:
            continue

        invoice = Invoice.objects.get(id=invoice_id, tenant=tenant)

        # ✅ calculate balance using allocation system
        allocated = get_invoice_allocated(invoice)
        balance = invoice.total_amount - allocated

        # ✅ prevent over-allocation completely
        if balance <= 0:
            continue

        amount = min(amount, balance)

        PaymentAllocation.objects.create(
            payment=payment,
            invoice=invoice,
            allocation_amount=amount,
            date=payment.date
        )

        total_allocated += amount

    return {
        "payment": payment,
        "total_allocated": float(total_allocated),
        "unallocated": float(payment.amount - total_allocated)
    }


def get_payment_details(payment):
    allocations = PaymentAllocation.objects.filter(payment=payment)

    allocation_data = []
    total_allocated = Decimal("0.00")

    for alloc in allocations:
        invoice = alloc.invoice
        allocated = alloc.allocation_amount

        total_allocated += allocated

        invoice_total_allocated = PaymentAllocation.objects.filter(
            invoice=invoice
        ).aggregate(total=Sum("allocation_amount"))["total"] or Decimal("0.00")

        status = "Paid" if invoice_total_allocated >= invoice.total_amount else "Partially Paid"

        allocation_data.append({
            "id": alloc.id,
            "invoice_id": invoice.id,
            "invoice_no": invoice.invoice_no,
            "due_date": invoice.due_date,
            "total_amount": float(invoice.total_amount),
            "allocated_amount": float(allocated),
            "status": status
        })

    return {
        "payment": payment,
        "tenant": payment.tenant,
        "allocations": allocation_data,
        "total_allocated": float(total_allocated),
        "unallocated": float(payment.amount - total_allocated)
    }