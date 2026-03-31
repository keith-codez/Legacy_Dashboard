from django.db import models

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
    unit_no = models.CharField(max_length=50)
    floor = models.IntegerField()
    size_sqm = models.IntegerField()
    base_rent = models.DecimalField(max_digits=10, decimal_places=2)
    unit_type = models.CharField(max_length=50)
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.unit_no


class Lease(models.Model):
    lease_number = models.CharField(max_length=50)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_day = models.IntegerField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.lease_number


class Invoice(models.Model):
    invoice_no = models.CharField(max_length=50)
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


class Payment(models.Model):
    payment_no = models.CharField(max_length=50)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50)
    receipt_no = models.CharField(max_length=50)
    reference = models.CharField(max_length=255)
    captured_by = models.CharField(max_length=100)

    def __str__(self):
        return self.payment_no


class PaymentAllocation(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    allocation_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()


class Interaction(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    subject = models.CharField(max_length=255)
    notes = models.TextField()
    date = models.DateField()
    recorded_by = models.CharField(max_length=100)
    priority = models.CharField(max_length=50)