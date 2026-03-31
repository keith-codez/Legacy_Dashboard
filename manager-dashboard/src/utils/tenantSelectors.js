/* ---------------- CORE ---------------- */

export const getTenantById = (tenants, id) =>
  tenants.find((t) => t.id === Number(id));

export const getTenantLeases = (leases, tenantId) =>
  leases.filter((l) => l.tenant_id === Number(tenantId));

export const getTenantUnits = (leases, units, tenantId) =>
  getTenantLeases(leases, tenantId)
    .map((l) => units.find((u) => u.id === l.unit_id))
    .filter(Boolean);

/* ---------------- STATUS ---------------- */

export const getTenantStatus = (leases, tenantId) => {
  const active = leases.find(
    (l) =>
      l.tenant_id === Number(tenantId) &&
      l.status === "Active"
  );
  return active ? "Active" : "Inactive";
};

/* ---------------- INVOICES ---------------- */

export const getTenantInvoices = (invoices, tenantId) =>
  invoices.filter((i) => i.tenant_id === Number(tenantId));

/* ---------------- PAYMENTS ---------------- */

export const getTenantPayments = (payments, tenantId) =>
  payments.filter((p) => p.tenant_id === Number(tenantId));

/* ---------------- SAFE ALLOCATIONS ---------------- */

export const getValidAllocationsByPayment = (payment, allocations) => {
  if (!payment) return [];

  const paymentAllocations = allocations.filter(
    a => a.payment_id === payment.id
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

export const getInvoicePaidAmount = (
  invoiceId,
  payments,
  allocations
) => {
  return allocations
    .filter(a => a.invoice_id === Number(invoiceId))
    .reduce((sum, a) => {
      const payment = payments.find(p => p.id === a.payment_id);

      const safe = getValidAllocationsByPayment(payment, allocations)
        .find(x => x.id === a.id);

      return sum + (safe?.safe_amount || 0);
    }, 0);
};

export const getInvoiceBalance = (
  invoice,
  payments,
  allocations
) => {
  if (!invoice) return 0;

  return invoice.total_amount - getInvoicePaidAmount(
    invoice.id,
    payments,
    allocations
  );
};

export const getInvoiceStatus = (
  invoice,
  payments,
  allocations
) => {
  if (!invoice) return "Unknown";

  const paid = getInvoicePaidAmount(
    invoice.id,
    payments,
    allocations
  );

  if (paid === 0) return "Open";
  if (paid < invoice.total_amount) return "Partially Paid";
  return "Paid";
};

/* ---------------- TENANT AGGREGATES ---------------- */

export const getTenantTotalInvoiced = (tenantId, invoices) =>
  invoices
    .filter(inv => inv.tenant_id === tenantId)
    .reduce((sum, inv) => sum + inv.total_amount, 0);

export const getTenantTotalPaid = (
  tenantId,
  payments,
  allocations
) => {
  return payments
    .filter(p => p.tenant_id === tenantId)
    .reduce((sum, p) => {
      const valid = getValidAllocationsByPayment(p, allocations);
      return sum + valid.reduce((s, a) => s + a.safe_amount, 0);
    }, 0);
};

export const getTenantBalance = (
  tenantId,
  invoices,
  payments,
  allocations
) =>
  getTenantTotalInvoiced(tenantId, invoices) -
  getTenantTotalPaid(tenantId, payments, allocations);

/* ---------------- INTERACTIONS ---------------- */

export const getTenantInteractions = (interactions, tenantId) =>
  interactions.filter(
    (i) => i.tenant_id === Number(tenantId)
  );

/* ---------------- OUTSTANDING ---------------- */

export const getTenantOutstandingInvoices = (
  tenantId,
  invoices,
  payments,
  allocations
) => {
  return invoices.filter(inv => {
    if (inv.tenant_id !== tenantId) return false;

    const balance = getInvoiceBalance(
      inv,
      payments,
      allocations
    );

    return balance > 0;
  });
};

/* ---------------- AUTO ALLOCATE ---------------- */

export const autoAllocateInvoices = (
  tenantId,
  paymentAmount,
  invoices,
  payments,
  allocations
) => {
  const outstanding = getTenantOutstandingInvoices(
    tenantId,
    invoices,
    payments,
    allocations
  ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  let remaining = paymentAmount;
  const result = {};

  for (const inv of outstanding) {
    const balance = getInvoiceBalance(
      inv,
      payments,
      allocations
    );

    if (balance <= 0) continue;

    const allocate = Math.min(balance, remaining);
    if (allocate <= 0) break;

    result[inv.id] = allocate;
    remaining -= allocate;

    if (remaining <= 0) break;
  }

  return result;
};