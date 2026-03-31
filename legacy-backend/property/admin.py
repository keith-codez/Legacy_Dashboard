from django.contrib import admin
from .models import *

admin.site.register(Tenant)
admin.site.register(Unit)
admin.site.register(Lease)
admin.site.register(Invoice)
admin.site.register(Payment)
admin.site.register(PaymentAllocation)
admin.site.register(Interaction)