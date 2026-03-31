import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import PaymentAllocation

class Command(BaseCommand):
    help = "Seed Payment Allocations with detailed error reporting"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "payment_allocations.json")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        with open(file_path, "r") as f:
            data = json.load(f)

        count = 0
        errors = 0

        for item in data:
            try:
                PaymentAllocation.objects.update_or_create(
                    id=item["id"],
                    defaults={
                        "payment_id": item["payment_id"],
                        "invoice_id": item["invoice_id"],
                        "allocation_amount": item["allocation_amount"],
                        "date": item["date"],
                    }
                )
                count += 1
            except Exception as e:
                errors += 1
                # This will print the exact ID and the specific IDs it was looking for
                self.stdout.write(self.style.ERROR(
                    f"FAILED - Allocation ID: {item['id']} | "
                    f"Looking for Payment: {item['payment_id']} and Invoice: {item['invoice_id']} | "
                    f"Error: {e}"
                ))

        if errors == 0:
            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} allocations."))
        else:
            self.stdout.write(self.style.WARNING(f"Seeded {count} records, but {errors} records failed (see above)."))
