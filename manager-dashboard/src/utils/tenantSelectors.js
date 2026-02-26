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

export const getTenantBalance = (tenantId) => {
  const tenantInvoices = getTenantInvoices(tenantId);

  const invoiced = tenantInvoices.reduce(
    (sum, i) => sum + i.total_amount,
    0
  );

  const allocated = allocations
    .filter((a) =>
      tenantInvoices.some((i) => i.id === a.invoice_id)
    )
    .reduce((sum, a) => sum + a.allocation_amount, 0);

  return invoiced - allocated;
};

