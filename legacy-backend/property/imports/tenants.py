import json
import os
from property.models import Tenant

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

file_path = os.path.join(BASE_DIR, "data", "tenants.json")

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
            "industry": item.get("industry", ""),
            "created_at": item["created_at"],
        }
    )

print("Tenants seeded successfully")