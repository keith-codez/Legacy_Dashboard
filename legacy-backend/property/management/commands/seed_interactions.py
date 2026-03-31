import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import Interaction

class Command(BaseCommand):
    help = "Seed Interactions from property/data/interactions.json"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "interactions.json")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            count = 0
            for item in data:
                Interaction.objects.update_or_create(
                    id=item["id"],
                    defaults={
                        "tenant_id": item["tenant_id"],
                        "type": item["type"],
                        "subject": item["subject"],
                        "notes": item["notes"],
                        "date": item["date"],
                        "recorded_by": item["recorded_by"],
                        "priority": item["priority"],
                    }
                )
                count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} Interactions."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error seeding interactions: {e}"))
