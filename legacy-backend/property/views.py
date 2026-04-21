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
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4

from datetime import datetime, date, timedelta
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





class TenantOutstandingBalancesView(APIView):

    def get(self, request):

        tenants = Tenant.objects.all()

        data = []

        for tenant in tenants:

            invoices = Invoice.objects.filter(tenant=tenant)
            allocations = PaymentAllocation.objects.filter(invoice__tenant=tenant)

            total_invoiced = sum(float(i.total_amount) for i in invoices)
            total_paid = sum(float(a.allocation_amount) for a in allocations)

            outstanding = total_invoiced - total_paid

            # only include tenants with debt exposure
            if outstanding > 0:
                data.append({
                    "tenant": tenant.company_name,
                    "outstanding": round(outstanding, 2)
                })

        # sort by highest risk first
        data = sorted(data, key=lambda x: x["outstanding"], reverse=True)

        return Response(data)

        
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

        doc = SimpleDocTemplate(
            response,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )

        styles = getSampleStyleSheet()
        elements = []

        # ===============================
        # CUSTOM STYLES (BRAND SYSTEM)
        # ===============================
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontSize=20,
            textColor=colors.HexColor("#111827"),
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            "Subtitle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#6B7280"),
            spaceAfter=18
        )

        section_header = ParagraphStyle(
            "SectionHeader",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=10
        )

        # ===============================
        # DATA
        # ===============================
        invoices = Invoice.objects.all()
        allocations = PaymentAllocation.objects.all()
        units = Unit.objects.all()

        total_invoiced = sum(float(i.total_amount) for i in invoices)
        total_paid = sum(float(a.allocation_amount) for a in allocations)
        outstanding = total_invoiced - total_paid

        occupied_units = units.filter(lease__status="Active").distinct().count()
        occupancy = (occupied_units / units.count() * 100) if units.count() else 0

        today = datetime.now().strftime("%d %B %Y")

        # ===============================
        # HEADER (BRANDED)
        # ===============================
        elements.append(Paragraph("PORTFOLIO FINANCIAL REPORT", title_style))
        elements.append(Paragraph(f"Generated: {today}", subtitle_style))

        elements.append(Spacer(1, 12))

        # ===============================
        # SUMMARY CARDS TABLE (UPGRADED)
        # ===============================
        summary_data = [
            ["Metric", "Value"],
            ["Total Invoiced", f"${total_invoiced:,.2f}"],
            ["Total Paid", f"${total_paid:,.2f}"],
            ["Outstanding", f"${outstanding:,.2f}"],
            ["Occupancy Rate", f"{occupancy:.2f}%"],
        ]

        summary_table = Table(summary_data, colWidths=[200, 250])

        summary_table.setStyle(TableStyle([
            # Header
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

            # Body styling
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F9FAFB")),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#111827")),

            # Grid + spacing
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("PADDING", (0, 0), (-1, -1), 10),

            # Alignment
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ]))

        elements.append(summary_table)
        elements.append(PageBreak())

        # ===============================
        # TENANT BREAKDOWN
        # ===============================
        elements.append(Paragraph("Tenant Breakdown", section_header))
        elements.append(Spacer(1, 10))

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

        tenant_table = Table(
            tenant_rows,
            colWidths=[200, 100, 100, 100]
        )

        # Zebra styling for readability
        style = TableStyle([
            # Header
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),

            # Body grid
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("PADDING", (0, 0), (-1, -1), 8),

            # Alignment
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])

        # Zebra rows (alternating background)
        for i in range(1, len(tenant_rows)):
            if i % 2 == 0:
                style.add("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F3F4F6"))
            else:
                style.add("BACKGROUND", (0, i), (-1, i), colors.white)

        tenant_table.setStyle(style)

        elements.append(tenant_table)

        doc.build(elements)
        return response




class StatementExportView(APIView):

    def get(self, request):

        tenant_id = request.GET.get("tenant")

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="tenant_statements.pdf"'

        doc = SimpleDocTemplate(
            response,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )

        styles = getSampleStyleSheet()
        elements = []

        # ============================
        # CUSTOM STYLES
        # ============================
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontSize=18,
            textColor=colors.HexColor("#111827"),
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            "Sub",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#6B7280"),
            spaceAfter=12
        )

        section_style = ParagraphStyle(
            "Section",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=10
        )

        today = datetime.now().strftime("%d %B %Y")

        # ============================
        # TENANTS FILTER
        # ============================
        tenants_qs = Tenant.objects.all()

        if tenant_id and tenant_id != "all":
            tenants_qs = tenants_qs.filter(id=tenant_id)

        # ============================
        # LOOP TENANTS
        # ============================
        for tenant in tenants_qs:

            invoices = Invoice.objects.filter(
                tenant=tenant
            ).order_by("issue_date")

            if not invoices.exists():
                continue

            # ============================
            # HEADER BLOCK (PER TENANT)
            # ============================
            elements.append(Paragraph("TENANT STATEMENT", title_style))
            elements.append(Paragraph(f"{tenant.company_name}", section_style))
            elements.append(Paragraph(f"Generated: {today}", subtitle_style))

            elements.append(Spacer(1, 12))

            # ============================
            # LEDGER TABLE
            # ============================
            ledger = [["Date", "Type", "Reference", "Debit", "Credit", "Balance"]]

            balance = 0

            for inv in invoices:
                balance += float(inv.total_amount)

                ledger.append([
                    inv.issue_date.strftime("%Y-%m-%d"),
                    "Invoice",
                    inv.invoice_no,
                    f"${inv.total_amount:,.2f}",
                    "-",
                    f"${balance:,.2f}",
                ])

                allocations = PaymentAllocation.objects.filter(invoice=inv)

                for alloc in allocations:
                    balance -= float(alloc.allocation_amount)

                    ledger.append([
                        alloc.date.strftime("%Y-%m-%d"),
                        "Payment",
                        alloc.payment.payment_no,
                        "-",
                        f"${alloc.allocation_amount:,.2f}",
                        f"${balance:,.2f}",
                    ])

            table = Table(
                ledger,
                colWidths=[70, 70, 100, 70, 70, 80]
            )

            table.setStyle(TableStyle([

                # HEADER ROW
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),

                # BODY
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),

                # ALIGNMENT
                ("ALIGN", (3, 1), (-1, -1), "RIGHT"),

                # PADDING
                ("PADDING", (0, 0), (-1, -1), 6),
            ]))

            # ============================
            # ZEBRA STRIPING (READABILITY BOOST)
            # ============================
            for i in range(1, len(ledger)):
                if i % 2 == 0:
                    table.setStyle(TableStyle([
                        ("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F9FAFB"))
                    ]))

            elements.append(table)

            elements.append(PageBreak())

        doc.build(elements)
        return response