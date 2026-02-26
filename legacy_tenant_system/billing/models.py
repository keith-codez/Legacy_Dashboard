from django.db import models
from tenants.models import Tenant
from leases.models import Lease

class Invoice(models.Model):
    INVOICE_TYPES = [
        ('rent', 'Rent'),
        ('service', 'Service'),
        ('penalty', 'Penalty'),
        ('other', 'Other'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    lease = models.ForeignKey(Lease, on_delete=models.PROTECT, null=True, blank=True)

    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPES)
    period_start = models.DateField()
    period_end = models.DateField()

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    issued_at = models.DateField(auto_now_add=True)

class Payment(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    receipt_number = models.CharField(max_length=100, blank=True)

class PaymentAllocation(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

