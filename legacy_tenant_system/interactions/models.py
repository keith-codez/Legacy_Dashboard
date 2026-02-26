from django.db import models
from tenants.models import Tenant
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Interaction(models.Model):
    TYPES = [
        ('call', 'Call'),
        ('sms', 'SMS'),
        ('wa', 'WhatsApp'),
        ('email', 'Email'),
        ('visit', 'Visit'),
        ('notice', 'Notice'),
        ('complaint', 'Complaint'),
        ('other', 'Other'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    interaction_type = models.CharField(max_length=20, choices=TYPES)
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
