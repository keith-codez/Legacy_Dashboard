import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import Lease

class Command(BaseCommand):
    help = "Seed Leases from property/data/leases.json"

    def handle(self, *args, **kwargs):
        # Path updated to match your 'property/data' structure
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "leases.json")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            count = 0
            for item in data:
                # Using update_or_create to keep data clean
                lease, created = Lease.objects.update_or_create(
                    id=item["id"],
                    defaults={
                        "lease_number": item["lease_number"],
                        "tenant_id": item["tenant_id"],  # Maps to the Tenant ID in JSON
                        "unit_id": item["unit_id"],      # Maps to the Unit ID in JSON
                        "start_date": item["start_date"],
                        "end_date": item["end_date"],
                        "rent_amount": item["rent_amount"],
                        "deposit_amount": item["deposit_amount"],
                        "billing_day": item["billing_day"],
                        "status": item["status"],
                    }
                )
                count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} Leases."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error seeding leases: {e}"))
