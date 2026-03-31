import json, os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import Tenant

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "tenants.json")
        with open(file_path, "r") as f:
            data = json.load(f)
        for item in data:
            Tenant.objects.update_or_create(
                id=item["id"],
                defaults={
                    "company_name": item["company_name"],
                    "primary_contact": item["primary_contact"],
                    "primary_email": item["primary_email"],
                    "phone": item["phone"],
                    "industry": item["industry"],
                }
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(data)} Tenants"))
