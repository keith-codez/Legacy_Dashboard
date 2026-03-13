import invoices from "../data/invoices.json";
import leases from "../data/leases.json";

/*
Generate next invoice number
*/
export const getNextInvoiceNumber = () => {

  const maxId = Math.max(...invoices.map(i => i.id));

  const nextId = maxId + 1;

  return {
    id: nextId,
    invoice_no: `INV-${String(nextId).padStart(3,"0")}`
  };

};


/*
Check duplicate invoice
*/
export const invoiceExists = (
  tenantId,
  type,
  periodStart,
  periodEnd
) => {

  return invoices.find(
    inv =>
      inv.tenant_id === Number(tenantId) &&
      inv.type === type &&
      inv.period_start === periodStart &&
      inv.period_end === periodEnd
  );

};


/*
Generate a single invoice
*/
export const generateInvoice = ({
  tenant_id,
  lease_id,
  type,
  period_start,
  period_end,
  issue_date,
  due_date,
  total_amount
}) => {

  const duplicate = invoiceExists(
    tenant_id,
    type,
    period_start,
    period_end
  );

  if (duplicate) return null;

  const { id, invoice_no } = getNextInvoiceNumber();

  return {
    id,
    invoice_no,
    tenant_id,
    lease_id,
    type,
    period_start,
    period_end,
    issue_date,
    due_date,
    total_amount
  };

};


/*
Auto generate monthly invoices for ALL active leases
*/
export const autoGenerateMonthlyInvoices = ({
  period_start,
  period_end,
  issue_date,
  due_date,
  type = "Rent"
}) => {

  const activeLeases = leases.filter(
    l => l.status === "Active"
  );

  const newInvoices = [];

  activeLeases.forEach(lease => {

    const duplicate = invoiceExists(
      lease.tenant_id,
      type,
      period_start,
      period_end
    );

    if (duplicate) return;

    const { id, invoice_no } = getNextInvoiceNumber();

    const invoice = {
      id,
      invoice_no,
      tenant_id: lease.tenant_id,
      lease_id: lease.id,
      type,
      period_start,
      period_end,
      issue_date,
      due_date,
      total_amount: lease.rent_amount
    };

    newInvoices.push(invoice);

  });

  return newInvoices;

};