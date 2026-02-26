from django.db import transaction
from django.db.models import Sum

from .models import Invoice, Payment, PaymentAllocation


# =====================================================
# BALANCE COMPUTATION
# =====================================================

def get_tenant_balance(tenant):
    """
    Returns a financial snapshot for a tenant.
    """

    total_invoiced = (
        Invoice.objects
        .filter(tenant=tenant)
        .aggregate(total=Sum("amount"))
        .get("total") or 0
    )

    total_paid = (
        PaymentAllocation.objects
        .filter(invoice__tenant=tenant)
        .aggregate(total=Sum("amount"))
        .get("total") or 0
    )

    balance = total_invoiced - total_paid

    return {
        "total_invoiced": total_invoiced,
        "total_paid": total_paid,
        "balance": balance,
    }


def get_invoice_balance(invoice):
    """
    Returns remaining balance for a single invoice.
    """

    allocated = (
        PaymentAllocation.objects
        .filter(invoice=invoice)
        .aggregate(total=Sum("amount"))
        .get("total") or 0
    )

    return invoice.amount - allocated


# =====================================================
# PAYMENT ALLOCATION — MANUAL (UI-DRIVEN)
# =====================================================

@transaction.atomic
def allocate_payment_manually(payment, allocations):
    """
    Manually allocate a payment to selected invoices.

    allocations = [
        {"invoice_id": 1, "amount": 300},
        {"invoice_id": 2, "amount": 200},
    ]

    Returns remaining credit (if any).
    """

    total_allocated = 0

    for item in allocations:
        invoice = Invoice.objects.select_for_update().get(id=item["invoice_id"])

        # Safety checks
        if invoice.tenant != payment.tenant:
            raise ValueError("Invoice does not belong to selected tenant")

        amount = item.get("amount", 0)

        if amount <= 0:
            raise ValueError("Allocation amount must be greater than zero")

        invoice_balance = get_invoice_balance(invoice)

        if amount > invoice_balance:
            raise ValueError("Allocation exceeds invoice balance")

        PaymentAllocation.objects.create(
            payment=payment,
            invoice=invoice,
            amount=amount
        )

        total_allocated += amount

    if total_allocated > payment.amount:
        raise ValueError("Total allocation exceeds payment amount")

    remaining_credit = payment.amount - total_allocated
    return remaining_credit


# =====================================================
# PAYMENT ALLOCATION — AUTO (OPTIONAL / FALLBACK)
# =====================================================

@transaction.atomic
def auto_allocate_payment(payment):
    """
    Automatically allocate payment to oldest unpaid invoices.
    """

    remaining_amount = payment.amount

    invoices = (
        Invoice.objects
        .filter(tenant=payment.tenant)
        .order_by("period_start", "id")
    )

    for invoice in invoices:
        if remaining_amount <= 0:
            break

        invoice_balance = get_invoice_balance(invoice)

        if invoice_balance <= 0:
            continue

        allocation_amount = min(invoice_balance, remaining_amount)

        PaymentAllocation.objects.create(
            payment=payment,
            invoice=invoice,
            amount=allocation_amount
        )

        remaining_amount -= allocation_amount

    return remaining_amount  # credit if > 0


# =====================================================
# PAYMENT ENTRY ORCHESTRATION (OPTIONAL HELPER)
# =====================================================

@transaction.atomic
def record_payment(
    tenant,
    amount,
    payment_date,
    receipt_number=None,
    allocations=None
):
    """
    High-level helper for recording a payment.

    - Creates payment
    - Applies manual allocations if provided
    - Otherwise auto-allocates
    """

    payment = Payment.objects.create(
        tenant=tenant,
        amount=amount,
        payment_date=payment_date,
        receipt_number=receipt_number or ""
    )

    if allocations:
        remaining = allocate_payment_manually(payment, allocations)
    else:
        remaining = auto_allocate_payment(payment)

    return {
        "payment_id": payment.id,
        "remaining_credit": remaining
    }
