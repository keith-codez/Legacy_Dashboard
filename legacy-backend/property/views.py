from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Value, DecimalField, Count
from django.db.models.functions import Coalesce
from itertools import chain
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from .models import *

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.utils.dateparse import parse_date

from django.db.models.functions import TruncMonth

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

class OccupancyTrendView(APIView):
    def get(self, request):
        units_count = Unit.objects.count()

        leases = (
            Lease.objects
            .annotate(month=TruncMonth("start_date"))
            .values("month")
            .annotate(active=Count("id"))
            .order_by("month")
        )

        return Response([
            {
                "month": l["month"].strftime("%Y-%m"),
                "occupancyRate": round((l["active"] / units_count) * 100, 2)
            }
            for l in leases
        ])

class RevenueTrendView(APIView):
    def get(self, request):
        data = (
            Invoice.objects
            .annotate(month=TruncMonth("issue_date"))
            .values("month")
            .annotate(revenue=Sum("total_amount"))
            .order_by("month")
        )

        return Response([
            {
                "month": d["month"].strftime("%Y-%m"),
                "revenue": float(d["revenue"] or 0)
            }
            for d in data
        ])

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
    queryset = Unit.objects.all().prefetch_related("lease_set")
    serializer_class = UnitSerializer

    def perform_create(self, serializer):
        unit_no = serializer.validated_data.get("unit_no")

        if Unit.objects.filter(unit_no__iexact=unit_no).exists():
            raise serializers.ValidationError("Unit already exists")

        serializer.save(unit_no=unit_no.strip().upper())


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



# views.py



class ReportsView(APIView):
    def get(self, request):
        tenant_id = request.query_params.get("tenant")
        period = request.query_params.get("period")  # YYYY-MM

        tenants = Tenant.objects.all()

        # derive month range if period exists
        start_date = end_date = None

        if period:
            try:
                start_date = datetime.strptime(period, "%Y-%m").date().replace(day=1)

                # next month logic
                if start_date.month == 12:
                    end_date = start_date.replace(year=start_date.year + 1, month=1)
                else:
                    end_date = start_date.replace(month=start_date.month + 1)

            except Exception:
                start_date = end_date = None

        data = []

        for tenant in tenants:

            if tenant_id and str(tenant.id) != tenant_id:
                continue

            invoices = Invoice.objects.filter(tenant=tenant)

            if start_date and end_date:
                invoices = invoices.filter(issue_date__gte=start_date, issue_date__lt=end_date)

            total_invoiced = invoices.aggregate(
                total=Sum("total_amount")
            )["total"] or 0

            total_paid = PaymentAllocation.objects.filter(
                invoice__tenant=tenant,
            )

            if start_date and end_date:
                total_paid = total_paid.filter(invoice__issue_date__gte=start_date,
                                               invoice__issue_date__lt=end_date)

            total_paid = total_paid.aggregate(
                total=Sum("allocation_amount")
            )["total"] or 0

            balance = total_invoiced - total_paid

            data.append({
                "tenant_id": tenant.id,
                "tenant": tenant.company_name,
                "invoiced": float(total_invoiced),
                "paid": float(total_paid),
                "balance": float(balance)
            })

        return Response(data)

class TenantStatementView(APIView):
    def get(self, request, pk):
        tenant = Tenant.objects.get(pk=pk)

        invoices = Invoice.objects.filter(tenant=tenant).order_by("issue_date")

        ledger = []

        for inv in invoices:
            ledger.append({
                "date": inv.issue_date,
                "type": "Invoice",
                "ref": inv.invoice_no,
                "debit": float(inv.total_amount),
                "credit": 0,
            })

            allocations = PaymentAllocation.objects.filter(invoice=inv)

            for alloc in allocations:
                ledger.append({
                    "date": alloc.date,
                    "type": "Payment",
                    "ref": alloc.payment.payment_no,
                    "debit": 0,
                    "credit": float(alloc.allocation_amount),
                })

        # sort + running balance
        ledger.sort(key=lambda x: x["date"])

        balance = 0
        enriched = []

        for entry in ledger:
            balance += entry["debit"]
            balance -= entry["credit"]

            enriched.append({
                **entry,
                "balance": balance
            })

        return Response({
            "tenant": {
                "id": tenant.id,
                "company_name": tenant.company_name
            },
            "ledger": enriched
        })
    




class PortfolioExportView(APIView):

    def get(self, request):

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="portfolio_report.pdf"'

        doc = SimpleDocTemplate(response, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        invoices = Invoice.objects.all()
        allocations = PaymentAllocation.objects.all()
        units = Unit.objects.all()

        total_invoiced = sum(float(i.total_amount) for i in invoices)
        total_paid = sum(float(a.allocation_amount) for a in allocations)
        outstanding = total_invoiced - total_paid

        occupied_units = units.filter(lease__status="Active").distinct().count()
        occupancy = (occupied_units / units.count() * 100) if units.count() else 0

        # ---------------- HEADER ----------------
        elements.append(Paragraph("PORTFOLIO FINANCIAL REPORT", styles["Title"]))
        elements.append(Spacer(1, 12))

        summary_data = [
            ["Metric", "Value"],
            ["Total Invoiced", f"${total_invoiced:,.2f}"],
            ["Total Paid", f"${total_paid:,.2f}"],
            ["Outstanding", f"${outstanding:,.2f}"],
            ["Occupancy Rate", f"{occupancy:.2f}%"],
        ]

        summary_table = Table(summary_data, hAlign="LEFT")
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.black),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
            ("PADDING", (0,0), (-1,-1), 6),
        ]))

        elements.append(summary_table)
        elements.append(PageBreak())

        # ---------------- TENANT BREAKDOWN ----------------
        elements.append(Paragraph("Tenant Breakdown", styles["Heading2"]))
        elements.append(Spacer(1, 12))

        tenant_rows = [["Tenant", "Invoiced", "Paid", "Balance"]]

        tenants = Tenant.objects.all()

        for t in tenants:
            inv = Invoice.objects.filter(tenant=t)
            paid = PaymentAllocation.objects.filter(invoice__tenant=t)

            inv_total = sum(float(i.total_amount) for i in inv)
            paid_total = sum(float(p.allocation_amount) for p in paid)
            bal = inv_total - paid_total

            tenant_rows.append([
                t.company_name,
                f"${inv_total:,.2f}",
                f"${paid_total:,.2f}",
                f"${bal:,.2f}",
            ])

        table = Table(tenant_rows, hAlign="LEFT")
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.darkblue),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("PADDING", (0,0), (-1,-1), 6),
        ]))

        elements.append(table)

        doc.build(elements)
        return response


class StatementExportView(APIView):

    def get(self, request):

        tenant_id = request.GET.get("tenant")

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="tenant_statements.pdf"'

        doc = SimpleDocTemplate(response, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        tenants_qs = Tenant.objects.all()

        if tenant_id and tenant_id != "all":
            tenants_qs = tenants_qs.filter(id=tenant_id)

        for tenant in tenants_qs:

            invoices = Invoice.objects.filter(tenant=tenant).order_by("issue_date")

            if not invoices.exists():
                continue

            elements.append(Paragraph(tenant.company_name, styles["Title"]))
            elements.append(Spacer(1, 10))

            ledger = [["Date", "Type", "Ref", "Debit", "Credit", "Balance"]]

            balance = 0

            for inv in invoices:
                balance += float(inv.total_amount)

                ledger.append([
                    inv.issue_date.strftime("%Y-%m-%d"),
                    "Invoice",
                    inv.invoice_no,
                    f"{inv.total_amount:,.2f}",
                    "-",
                    f"{balance:,.2f}",
                ])

                for alloc in PaymentAllocation.objects.filter(invoice=inv):
                    balance -= float(alloc.allocation_amount)

                    ledger.append([
                        alloc.date.strftime("%Y-%m-%d"),
                        "Payment",
                        alloc.payment.payment_no,
                        "-",
                        f"{alloc.allocation_amount:,.2f}",
                        f"{balance:,.2f}",
                    ])

            table = Table(ledger, hAlign="LEFT")

            table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#111827")),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("GRID", (0,0), (-1,-1), 0.3, colors.grey),
                ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
                ("FONTSIZE", (0,0), (-1,-1), 8),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f9fafb")]),
                ("PADDING", (0,0), (-1,-1), 6),
            ]))

            elements.append(table)
            elements.append(PageBreak())

        doc.build(elements)
        return response