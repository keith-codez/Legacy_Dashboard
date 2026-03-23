import invoices from "../data/invoices.json";
import leases from "../data/leases.json";
import units from "../data/units.json";

/* Next invoice */
export const getNextInvoiceNumber = () => {
  const maxId = Math.max(...invoices.map(i => i.id));
  const nextId = maxId + 1;

  return {
    id: nextId,
    invoice_no: `INV-${String(nextId).padStart(3,"0")}`
  };
};

/* Duplicate check */
export const invoiceExists = (tenantId, type, start, end) =>
  invoices.find(
    inv =>
      inv.tenant_id === Number(tenantId) &&
      inv.type === type &&
      inv.period_start === start &&
      inv.period_end === end
  );

/* Auto generate */
export const autoGenerateMonthlyInvoices = ({
  period_start,
  period_end,
  issue_date,
  due_date,
  type = "Rent"
}) => {

  const activeLeases = leases.filter(l => l.status === "Active");

  const newInvoices = [];

  activeLeases.forEach(lease => {

    if (invoiceExists(lease.tenant_id, type, period_start, period_end)) return;

    const { id, invoice_no } = getNextInvoiceNumber();

    const unit = units.find(u => u.id === lease.unit_id);

    newInvoices.push({
      id,
      invoice_no,
      tenant_id: lease.tenant_id,
      lease_id: lease.id,
      type,
      period_start,
      period_end,
      issue_date,
      due_date,
      total_amount: lease.rent_amount || unit?.base_rent || 0
    });

  });

  return newInvoices;
};