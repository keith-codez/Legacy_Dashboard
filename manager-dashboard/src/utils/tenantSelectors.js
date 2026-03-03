import tenants from "../data/tenants.json";
import leases from "../data/leases.json";
import units from "../data/units.json";
import invoices from "../data/invoices.json";
import payments from "../data/payments.json";
import allocations from "../data/payment_allocations.json";
import interactions from "../data/interactions.json";

export const getTenantById = (id) =>
  tenants.find((t) => t.id === Number(id));

export const getTenantLeases = (tenantId) =>
  leases.filter((l) => l.tenant_id === Number(tenantId));

export const getTenantUnits = (tenantId) => {
  const tenantLeases = getTenantLeases(tenantId);
  return tenantLeases.map((l) =>
    units.find((u) => u.id === l.unit_id)
  );
};

export const getTenantInvoices = (tenantId) =>
  invoices.filter((i) => i.tenant_id === Number(tenantId));

export const getTenantInteractions = (tenantId) =>
  interactions.filter((i) => i.tenant_id === Number(tenantId));

export const getTenantBalance = (tenantId) =>
  getTenantInvoices(tenantId)
    .reduce(
      (sum, invoice) => sum + getInvoiceBalance(invoice.id),
      0
    );





export const getInvoiceAllocations = (invoiceId) =>
  allocations.filter(a => a.invoice_id === Number(invoiceId));

export const getInvoicePaidAmount = (invoiceId) =>
  getInvoiceAllocations(invoiceId)
    .reduce((sum, a) => sum + a.allocation_amount, 0);

export const getInvoiceBalance = (invoiceId) => {
  const invoice = invoices.find(i => i.id === Number(invoiceId));
  if (!invoice) return 0;

  const paid = getInvoicePaidAmount(invoiceId);
  return invoice.total_amount - paid;
};

export const getInvoiceStatus = (invoiceId) => {
  const invoice = invoices.find(i => i.id === Number(invoiceId));
  if (!invoice) return "Unknown";

  const balance = getInvoiceBalance(invoiceId);

  if (balance === 0) return "Paid";
  if (balance < invoice.total_amount) return "Partially Paid";
  return "Open";
};

export const getTenantOutstandingInvoices = (tenantId) =>
  getTenantInvoices(tenantId).filter(
    (invoice) => getInvoiceBalance(invoice.id) > 0
  );

  export const autoAllocateInvoices = (tenantId, paymentAmount) => {
  const invoices = getTenantOutstandingInvoices(tenantId)
    .sort(
      (a, b) =>
        new Date(a.due_date) - new Date(b.due_date)
    );

  let remaining = paymentAmount;
  const allocationMap = {};

  for (let invoice of invoices) {
    const balance = getInvoiceBalance(invoice.id);
    if (remaining <= 0) break;

    const amount = Math.min(balance, remaining);
    allocationMap[invoice.id] = amount;
    remaining -= amount;
  }

  return allocationMap;
};