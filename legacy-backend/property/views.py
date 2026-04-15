from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Value, DecimalField
from django.db.models.functions import Coalesce

from .models import *
from .serializers import *

from property.services.payment_service import (
    get_payment_details,
    create_payment_with_allocations
)
from property.services.allocation_service import (
    get_tenant_allocated,
    get_tenant_invoiced,
    get_invoice_allocated
)


# ---------------- DASHBOARD ----------------
class DashboardView(APIView):
    def get(self, request):
        total_tenants = Tenant.objects.count()
        active_leases = Lease.objects.filter(status="Active").count()

        total_invoiced = Invoice.objects.aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        total_paid = PaymentAllocation.objects.aggregate(
            total=Sum("allocation_amount")
        )["total"] or 0

        outstanding = total_invoiced - total_paid

        collection_rate = (total_paid / total_invoiced) * 100 if total_invoiced else 0
        arrears_ratio = (outstanding / total_invoiced) * 100 if total_invoiced else 0

        return Response({
            "total_tenants": total_tenants,
            "active_leases": active_leases,
            "total_invoiced": float(total_invoiced),
            "total_paid": float(total_paid),
            "outstanding": float(outstanding),
            "collection_rate": round(collection_rate, 2),
            "arrears_ratio": round(arrears_ratio, 2),
        })


# ---------------- TENANTS ----------------
class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        tenant = self.get_object()

        leases = Lease.objects.filter(tenant=tenant)
        invoices = (
            Invoice.objects
            .filter(tenant=tenant)
            .select_related("tenant", "lease")
            .annotate(
                paid_amount_db=Coalesce(
                    Sum("paymentallocation__allocation_amount"),
                    Value(0),
                    output_field=DecimalField()
                )
            )
        )
        interactions = Interaction.objects.filter(tenant=tenant)

        total_invoiced = get_tenant_invoiced(tenant)
        total_paid = get_tenant_allocated(tenant)
        balance = total_invoiced - total_paid

        return Response({
            "tenant": TenantSerializer(tenant).data,
            "leases": LeaseSerializer(leases, many=True).data,
            "interactions": InteractionSerializer(interactions, many=True).data,
            "invoices": InvoiceSerializer(invoices, many=True).data,
            "summary": {
                "total_invoiced": float(total_invoiced),
                "total_paid": float(total_paid),
                "balance": float(balance),
                "unit_count": leases.count(),
                "status": "Active" if leases.filter(status="Active").exists() else "Inactive"
            }
        })


# ---------------- UNITS ----------------
class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer


# ---------------- LEASES ----------------
class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.select_related("tenant", "unit")
    serializer_class = LeaseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        tenant_id = self.request.query_params.get("tenant")
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)

        return queryset


    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        lease = self.get_object()

        invoices = (
            Invoice.objects
            .filter(lease=lease)
            .annotate(
                paid_amount=Coalesce(
                    Sum("paymentallocation__allocation_amount"),
                    Value(0),
                    output_field=DecimalField()
                )
            )
        )

        enriched_invoices = []
        total_invoiced = 0
        total_paid = 0

        for inv in invoices:
            paid = float(inv.paid_amount or 0)
            total = float(inv.total_amount)
            balance = total - paid

            status = "Unpaid"
            if paid >= total:
                status = "Paid"
            elif paid > 0:
                status = "Partially Paid"

            enriched_invoices.append({
                "id": inv.id,
                "invoice_no": inv.invoice_no,
                "total_amount": total,
                "paid_amount": paid,
                "balance": balance,
                "status": status,
                "due_date": inv.due_date
            })

            total_invoiced += total
            total_paid += paid

        return Response({
            "lease": LeaseSerializer(lease).data,
            "invoices": enriched_invoices,
            "summary": {
                "total_invoiced": total_invoiced,
                "total_paid": total_paid,
                "balance": total_invoiced - total_paid
            }
        })

# ---------------- INVOICES ----------------

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return (
            Invoice.objects
            .select_related("tenant", "lease")
            .annotate(
                paid_amount_db=Coalesce(
                    Sum("paymentallocation__allocation_amount"),
                    Value(0),
                    output_field=DecimalField()
                )
            )
        )

    @action(detail=False, methods=["get"])
    def outstanding(self, request):
        tenant_id = request.query_params.get("tenant")

        invoices = self.get_queryset().filter(tenant_id=tenant_id)

        data = []

        for inv in invoices:
            paid = float(inv.paid_amount_db)
            balance = float(inv.total_amount) - paid

            if balance > 0:
                data.append({
                    "id": inv.id,
                    "invoice_no": inv.invoice_no,
                    "due_date": inv.due_date,
                    "total_amount": float(inv.total_amount),
                    "balance": balance
                })

        return Response(data)
    

# ---------------- PAYMENTS ----------------
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        try:
            result = create_payment_with_allocations(request.data.copy())

            return Response({
                "id": result["payment"].id,
                "payment_no": result["payment"].payment_no,
                "total_allocated": result["total_allocated"],
                "unallocated": result["unallocated"]
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["get"])
    def details(self, request, pk=None):
        payment = self.get_object()

        data = get_payment_details(payment)

        return Response({
            "payment": PaymentSerializer(data["payment"]).data,
            "tenant": {
                "id": data["tenant"].id,
                "company_name": data["tenant"].company_name
            },
            "allocations": data["allocations"],
            "total_allocated": data["total_allocated"],
            "unallocated": data["unallocated"]
        })


# ---------------- ALLOCATIONS ----------------
class PaymentAllocationViewSet(viewsets.ModelViewSet):
    queryset = PaymentAllocation.objects.select_related("payment", "invoice")
    serializer_class = PaymentAllocationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        invoice_id = self.request.query_params.get("invoice")
        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)
        return qs


# ---------------- INTERACTIONS ----------------
class InteractionViewSet(viewsets.ModelViewSet):
    queryset = Interaction.objects.all()
    serializer_class = InteractionSerializer