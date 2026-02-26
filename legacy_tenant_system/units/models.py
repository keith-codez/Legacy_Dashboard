from django.db import models

class Unit(models.Model):
    code = models.CharField(max_length=50, unique=True)
    floor = models.CharField(max_length=50)
    size_sqm = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    active = models.BooleanField(default=True)
