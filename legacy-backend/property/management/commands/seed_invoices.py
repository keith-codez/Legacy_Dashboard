import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import Invoice

class Command(BaseCommand):
    help = "Seed Invoices from property/data/invoices.json"

    def handle(self, *args, **kwargs):
        # Correct path for your setup
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "invoices.json")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            count = 0
            for item in data:
                Invoice.objects.update_or_create(
                    id=item["id"],
                    defaults={
                        "invoice_no": item["invoice_no"],
                        "tenant_id": item["tenant_id"],
                        "lease_id": item["lease_id"],
                        "type": item["type"],
                        "period_start": item["period_start"],
                        "period_end": item["period_end"],
                        "issue_date": item["issue_date"],
                        "due_date": item["due_date"],
                        "total_amount": item["total_amount"],
                    }
                )
                count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} Invoices."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error seeding invoices: {e}"))
