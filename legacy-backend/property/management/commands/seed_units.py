import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from property.models import Unit

class Command(BaseCommand):
    help = "Seed Units from data/units.json"

    def handle(self, *args, **kwargs):
        # Path to data/units.json relative to project root
        file_path = os.path.join(settings.BASE_DIR, "property", "data", "units.json")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            count = 0
            for item in data:
                # update_or_create prevents duplicates if you run this multiple times
                unit, created = Unit.objects.update_or_create(
                    id=item["id"],
                    defaults={
                        "unit_no": item["unit_no"],
                        "floor": item["floor"],
                        "size_sqm": item["size_sqm"],
                        "base_rent": item["base_rent"],
                        "unit_type": item["unit_type"],
                        "status": item["status"],
                    }
                )
                count += 1

            self.stdout.write(
                self.style.SUCCESS(f"Successfully processed {count} units.")
            )

        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR("Error: units.json is not valid JSON."))
        except KeyError as e:
            self.stdout.write(self.style.ERROR(f"Error: Missing expected JSON field: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An unexpected error occurred: {e}"))
