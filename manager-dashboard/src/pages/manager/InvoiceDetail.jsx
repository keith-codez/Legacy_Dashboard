import { useParams, useNavigate } from "react-router-dom";
import { Download, Pencil } from "lucide-react";

import invoices from "../../data/invoices.json";
import tenants from "../../data/tenants.json";
import payments from "../../data/payments.json";
import allocations from "../../data/payment_allocations.json";

import {
  getInvoiceBalance,
  getInvoiceStatus
} from "../../utils/tenantSelectors";

function InvoiceDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const invoice = invoices.find(i => i.id === Number(id));
  if (!invoice) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-semibold">Invoice not found</h1>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-gray-200 rounded"
      >
        Go Back
      </button>
    </div>
  );
}

const tenant = tenants.find(t => t.id === invoice.tenant_id);

  const invoiceAllocations = allocations.filter(
    a => a.invoice_id === invoice.id
  );

  const allocationPayments = invoiceAllocations.map(a => {

    const payment = payments.find(p => p.id === a.payment_id);

    return {
      ...a,
      payment_date: payment?.date,
      method: payment?.method
    };

  });

  const balance = getInvoiceBalance(invoice.id);
  const status = getInvoiceStatus(invoice.id);

  const statusStyles = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    Overdue: "bg-red-100 text-red-700",
    Open: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold">
            {invoice.invoice_no}
          </h1>

          <p className="text-gray-500">
            {tenant.company_name}
          </p>

        </div>

        <div className="flex">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Download className="w-4 h-4"/>
            Download PDF
          </button>

        </div>

      </div>

      {/* Status */}

      <div>
        <span className={`text-sm px-3 py-1 rounded-full ${statusStyles[status]}`}>
          {status}
        </span>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Issue Date</p>
          <p className="font-semibold">
            {new Date(invoice.issue_date).toLocaleDateString("en-GB")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Due Date</p>
          <p className="font-semibold">
            {new Date(invoice.due_date).toLocaleDateString("en-GB")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Amount</p>
          <p className="font-semibold text-lg">
            ${invoice.total_amount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Outstanding</p>
          <p className="font-semibold text-lg text-red-600">
            ${balance.toLocaleString()}
          </p>
        </div>

      </div>

      {/* Invoice Period */}

      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="font-semibold mb-3">
          Billing Period
        </h2>

        <p className="text-gray-600">
          {new Date(invoice.period_start).toLocaleDateString("en-GB")}
          {" "}–{" "}
          {new Date(invoice.period_end).toLocaleDateString("en-GB")}
        </p>

        <p className="text-gray-600 mt-2">
          Type: <strong>{invoice.type}</strong>
        </p>

      </div>

      {/* Allocations */}

      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="font-semibold">
            Payments Applied
          </h2>

        </div>

        {allocationPayments.length === 0 ? (

          <div className="p-6 text-gray-500">
            No payments allocated yet.
          </div>

        ) : (

          <table className="w-full text-sm">

            <thead className="bg-gray-50">

              <tr>

                <th className="p-4 text-left">Payment Date</th>
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-left">Allocated</th>

              </tr>

            </thead>

            <tbody>

              {allocationPayments.map(a => (

                <tr key={a.id} className="border-t">

                  <td className="p-4">
                    {new Date(a.payment_date).toLocaleDateString("en-GB")}
                  </td>

                  <td className="p-4">
                    {a.method}
                  </td>

                  <td className="p-4 font-semibold">
                    ${a.allocation_amount.toLocaleString()}
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

export default InvoiceDetail;