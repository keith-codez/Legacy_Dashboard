import tenants from "../data/tenants.json";
import leases from "../data/leases.json";
import units from "../data/units.json";
import invoices from "../data/invoices.json";
import payments from "../data/payments.json";
import allocations from "../data/payment_allocations.json";
import interactions from "../data/interactions.json";

/* ---------------- CORE ---------------- */

export const getTenantById = (id) =>
  tenants.find((t) => t.id === Number(id));

export const getTenantLeases = (tenantId) =>
  leases.filter((l) => l.tenant_id === Number(tenantId));

export const getTenantUnits = (tenantId) =>
  getTenantLeases(tenantId)
    .map((l) => units.find((u) => u.id === l.unit_id))
    .filter(Boolean);

/* ---------------- STATUS ---------------- */

export const getTenantStatus = (tenantId) => {
  const active = leases.find(
    (l) =>
      l.tenant_id === Number(tenantId) &&
      l.status === "Active"
  );
  return active ? "Active" : "Inactive";
};

/* ---------------- INVOICES ---------------- */

export const getTenantInvoices = (tenantId) =>
  invoices.filter((i) => i.tenant_id === Number(tenantId));

/* ---------------- PAYMENTS ---------------- */

export const getTenantPayments = (tenantId) =>
  payments.filter((p) => p.tenant_id === Number(tenantId));

/* ---------------- SAFE ALLOCATIONS ---------------- */

// CRITICAL FIX: never allow allocations > payment
export const getValidAllocationsByPayment = (paymentId) => {
  const payment = payments.find(p => p.id === Number(paymentId));
  if (!payment) return [];

  const paymentAllocations = allocations.filter(
    a => a.payment_id === Number(paymentId)
  );

  let runningTotal = 0;

  return paymentAllocations.map(a => {
    const remaining = payment.amount - runningTotal;

    const safeAmount = Math.max(
      0,
      Math.min(a.allocation_amount, remaining)
    );

    runningTotal += safeAmount;

    return {
      ...a,
      safe_amount: safeAmount
    };
  }).filter(a => a.safe_amount > 0);
};

/* ---------------- INVOICE CALCS ---------------- */

export const getInvoicePaidAmount = (invoiceId) => {
  return allocations
    .filter(a => a.invoice_id === Number(invoiceId))
    .reduce((sum, a) => {
      const safe = getValidAllocationsByPayment(a.payment_id)
        .find(x => x.id === a.id);

      return sum + (safe?.safe_amount || 0);
    }, 0);
};

export const getInvoiceBalance = (invoiceId) => {
  const invoice = invoices.find(i => i.id === Number(invoiceId));
  if (!invoice) return 0;

  return invoice.total_amount - getInvoicePaidAmount(invoiceId);
};

export const getInvoiceStatus = (invoiceId) => {
  const invoice = invoices.find(i => i.id === Number(invoiceId));
  if (!invoice) return "Unknown";

  const paid = getInvoicePaidAmount(invoiceId);

  if (paid === 0) return "Open";
  if (paid < invoice.total_amount) return "Partially Paid";
  return "Paid";
};

/* ---------------- TENANT AGGREGATES ---------------- */

export const getTenantTotalInvoiced = (tenantId) =>
  getTenantInvoices(tenantId)
    .reduce((sum, inv) => sum + inv.total_amount, 0);

export const getTenantTotalPaid = (tenantId) => {
  return getTenantPayments(tenantId)
    .reduce((sum, p) => {
      const valid = getValidAllocationsByPayment(p.id);
      return sum + valid.reduce((s, a) => s + a.safe_amount, 0);
    }, 0);
};

export const getTenantBalance = (tenantId) =>
  getTenantTotalInvoiced(tenantId) - getTenantTotalPaid(tenantId);

/* ---------------- INTERACTIONS ---------------- */

export const getTenantInteractions = (tenantId) =>
  interactions.filter(
    (i) => i.tenant_id === Number(tenantId)
  );

/* ---------------- AGING ---------------- */

export const getInvoiceAging = (invoice) => {
  const today = new Date("2025-02-10");
  const due = new Date(invoice.due_date);

  const diff = Math.floor(
    (today - due) / (1000 * 60 * 60 * 24)
  );

  if (diff <= 0) return "Current";
  if (diff <= 30) return "1-30 Days";
  if (diff <= 60) return "31-60 Days";
  return "60+ Days";
};

/* ---------------- OUTSTANDING INVOICES ---------------- */

/**
 * Returns all invoices for a tenant that are not fully paid.
 * This is required by AddPayment.jsx
 */
export const getTenantOutstandingInvoices = (tenantId) => {
  return getTenantInvoices(tenantId).filter(inv => getInvoiceBalance(inv.id) > 0);
};


/* ---------------- AUTO ALLOCATE ---------------- */

/**
 * Automatically allocates a payment amount across a tenant's outstanding invoices.
 * Oldest invoices get paid first. Returns an object keyed by invoiceId with amounts.
 */
export const autoAllocateInvoices = (tenantId, paymentAmount) => {
  const outstanding = getTenantOutstandingInvoices(tenantId)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)); // oldest first

  let remaining = paymentAmount;
  const allocations = {};

  for (const inv of outstanding) {
    const balance = getInvoiceBalance(inv.id);
    if (balance <= 0) continue;

    const allocate = Math.min(balance, remaining);
    if (allocate <= 0) break;

    allocations[inv.id] = allocate;
    remaining -= allocate;

    if (remaining <= 0) break;
  }

  return allocations;
};