from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Tenant(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)

    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
