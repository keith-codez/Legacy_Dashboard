from django.db import models
from django.db.models import Sum

class Tenant(models.Model):
    company_name = models.CharField(max_length=255)
    primary_contact = models.CharField(max_length=255)
    primary_email = models.EmailField()
    phone = models.CharField(max_length=20)
    industry = models.CharField(max_length=100)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.company_name


class Unit(models.Model):
    unit_no = models.CharField(max_length=50, unique=True)
    floor = models.IntegerField()
    size_sqm = models.IntegerField()
    base_rent = models.DecimalField(max_digits=10, decimal_places=2)
    unit_type = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        if not self.unit_no or not self.unit_no.strip():
            raise ValueError("unit_no is required")

        self.unit_no = self.unit_no.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.unit_no

    
    
    

class LeaseStatus(models.TextChoices):
    ACTIVE = "Active"
    EXPIRED = "Expired"
    TERMINATED = "Terminated"



class Lease(models.Model):
    lease_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_day = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=LeaseStatus.choices,
        default=LeaseStatus.ACTIVE
    )

    # SNAPSHOTS (TEMPORARILY NULLABLE)
    unit_no_snapshot = models.CharField(max_length=50, null=True, blank=True)
    unit_type_snapshot = models.CharField(max_length=50, null=True, blank=True)
    base_rent_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.lease_number
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new:
            if not self.lease_number:
                self.lease_number = f"L-{self.id:03d}"

            # populate snapshots (optional but recommended)
            if self.unit:
                self.unit_no_snapshot = self.unit.unit_no
                self.unit_type_snapshot = self.unit.unit_type
                self.base_rent_snapshot = self.unit.base_rent

            super().save(update_fields=[
                "lease_number",
                "unit_no_snapshot",
                "unit_type_snapshot",
                "base_rent_snapshot",
            ])

class Invoice(models.Model):
    invoice_no = models.CharField(max_length=50, unique=True, blank=True)

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE)

    type = models.CharField(max_length=50)
    period_start = models.DateField()
    period_end = models.DateField()
    issue_date = models.DateField()
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.invoice_no

    def save(self, *args, **kwargs):
        # Only generate if not provided
        if not self.invoice_no:
            last_invoice = Invoice.objects.order_by("-id").first()

            if last_invoice and last_invoice.invoice_no:
                try:
                    last_number = int(last_invoice.invoice_no.split("-")[1])
                except Exception:
                    last_number = 0
            else:
                last_number = 0

            self.invoice_no = f"INV-{last_number + 1:03d}"

        super().save(*args, **kwargs)

    def get_paid_amount(self):
        return (
            self.paymentallocation_set.aggregate(
                total=Sum("allocation_amount")
            )["total"] or 0
        )


class Payment(models.Model):
    payment_no = models.CharField(max_length=20, unique=True, blank=True)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50)
    receipt_no = models.CharField(max_length=50)
    reference = models.CharField(max_length=255)
    captured_by = models.CharField(max_length=100)

    def __str__(self):
        return self.payment_no
    
    def save(self, *args, **kwargs):
        if not self.payment_no:
            last_payment = Payment.objects.order_by("-id").first()

            if last_payment and last_payment.payment_no:
                last_number = int(last_payment.payment_no.split("-")[1])
            else:
                last_number = 0

            self.payment_no = f"PAY-{last_number + 1:03d}"

        super().save(*args, **kwargs)


class PaymentAllocation(models.Model):
    payment = models.ForeignKey("Payment", on_delete=models.CASCADE)
    invoice = models.ForeignKey("Invoice", on_delete=models.CASCADE)
    allocation_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["payment", "invoice"],
                name="unique_payment_invoice"
            )
        ]
    def __str__(self):
        return f"{self.payment.payment_no} -> {self.invoice.invoice_no} ({self.allocation_amount})"
    

class Interaction(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    subject = models.CharField(max_length=255)
    notes = models.TextField()
    date = models.DateField()
    recorded_by = models.CharField(max_length=100)
    priority = models.CharField(max_length=50)


