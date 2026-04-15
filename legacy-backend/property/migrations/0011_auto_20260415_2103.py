from django.db import migrations


def backfill_snapshots(apps, schema_editor):
    Lease = apps.get_model("property", "Lease")

    for lease in Lease.objects.select_related("unit").all():
        lease.unit_no_snapshot = lease.unit.unit_no
        lease.unit_type_snapshot = lease.unit.unit_type
        lease.base_rent_snapshot = lease.unit.base_rent

        lease.save(update_fields=[
            "unit_no_snapshot",
            "unit_type_snapshot",
            "base_rent_snapshot"
        ])


class Migration(migrations.Migration):

    dependencies = [
        ("property", "0010_lease_base_rent_snapshot_lease_unit_no_snapshot_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_snapshots, reverse_code=migrations.RunPython.noop),
    ]