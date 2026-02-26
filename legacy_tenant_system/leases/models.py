from django.db import models
from tenants.models import Tenant
from units.models import Unit

class Lease(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    rent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    service_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    active = models.BooleanField(default=True)
