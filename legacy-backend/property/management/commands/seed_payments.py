import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import Payment

class Command(BaseCommand):
    help = "Seed Payments from property/data/payments.json"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "payments.json")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            count = 0
            for item in data:
                Payment.objects.update_or_create(
                    id=item["id"],
                    defaults={
                        "payment_no": item["payment_no"],
                        "tenant_id": item["tenant_id"],
                        "date": item["date"],
                        "amount": item["amount"],
                        "method": item["method"],
                        "receipt_no": item["receipt_no"],
                        "reference": item.get("reference", ""),
                        "captured_by": item.get("captured_by", "System Admin"),
                    }
                )
                count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} Payments."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error seeding payments: {e}"))
