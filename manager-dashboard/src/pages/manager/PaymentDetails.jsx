// =========================
// 1. NEW: PaymentDetail.jsx (WITH LINKED INVOICES + CLICK NAV)
// =========================

import { useParams, useNavigate } from "react-router-dom";

import payments from "../../data/payments.json";
import tenants from "../../data/tenants.json";
import invoices from "../../data/invoices.json";
import allocations from "../../data/payment_allocations.json";

import { getInvoiceStatus } from "../../utils/tenantSelectors";

function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const payment = payments.find(p => p.id === Number(id));

  if (!payment) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Payment not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const tenant = tenants.find(t => t.id === payment.tenant_id);

  const paymentAllocations = allocations.filter(
    a => a.payment_id === payment.id
  );

  const linkedInvoices = paymentAllocations.map(a => {
    const invoice = invoices.find(i => i.id === a.invoice_id);

    return {
      ...a,
      invoice_id: invoice?.id,
      invoice_no: invoice?.invoice_no,
      due_date: invoice?.due_date,
      status: getInvoiceStatus(invoice?.id)
    };
  });

  const totalAllocated = paymentAllocations.reduce(
    (sum, a) => sum + a.allocation_amount,
    0
  );

  const unallocated = payment.amount - totalAllocated;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{payment.payment_no}</h1>
          <p className="text-gray-500">{tenant?.company_name}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
      </div>

      {/* META DETAILS */}
      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <p className="text-sm text-gray-500">Payment Method</p>
          <p className="font-semibold">{payment.method || "—"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Reference</p>
          <p className="font-semibold">{payment.reference || "—"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Captured By</p>
          <p className="font-semibold">{payment.captured_by || "System"}</p>
        </div>

        <div>
            <p className="text-sm text-gray-500">Payment Date</p>
            <p className="font-semibold">
                {new Date(payment.date).toLocaleDateString("en-GB")}
            </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="font-semibold">
            {payment.notes || "No notes provided"}
          </p>
        </div>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Payment Date</p>
          <p className="font-semibold">
            {new Date(payment.date).toLocaleDateString("en-GB")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Amount Paid</p>
          <p className="font-semibold text-green-600 text-lg">
            ${payment.amount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Allocated</p>
          <p className="font-semibold text-blue-600">
            ${totalAllocated.toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Unallocated</p>
          <p className="font-semibold text-red-600">
            ${unallocated.toLocaleString()}
          </p>
        </div>

      </div>

      {/* LINKED INVOICES */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-semibold">Invoice Allocations</h2>
        </div>

        {linkedInvoices.length === 0 ? (
          <div className="p-6 text-gray-500">
            No invoices linked to this payment.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Invoice</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Allocated</th>
              </tr>
            </thead>

            <tbody>
              {linkedInvoices.map(inv => (
                <tr
                  key={inv.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/manager/invoices/${inv.invoice_id}`)}
                >
                  <td className="p-4 font-medium text-blue-600 underline">
                    {inv.invoice_no}
                  </td>

                  <td className="p-4">
                    {new Date(inv.due_date).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-4">
                    {inv.status}
                  </td>

                  <td className="p-4 font-semibold">
                    ${inv.allocation_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}

export default PaymentDetail;




