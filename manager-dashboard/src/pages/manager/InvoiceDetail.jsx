import { useParams, useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { getInvoice, getInvoiceAllocations } from "../../api/api";

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [inv, allocs] = await Promise.all([
          getInvoice(id),
          getInvoiceAllocations(id),
        ]);

        setInvoice(inv);
        setAllocations(allocs);
      } catch (e) {
        console.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

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

  const statusStyles = {
    Paid: "bg-green-100 text-green-700",
    "Partially Paid": "bg-yellow-100 text-yellow-700",
    Unpaid: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoice_no}</h1>
          <p className="text-gray-500">{invoice.tenant_name}</p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* STATUS */}
      <span className={`text-sm px-3 py-1 rounded-full ${statusStyles[invoice.status]}`}>
        {invoice.status}
      </span>

      {/* SUMMARY */}
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
          <p className="text-gray-500 text-sm">Total</p>
          <p className="font-semibold text-lg">
            ${Number(invoice.total_amount).toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Outstanding</p>
          <p className="font-semibold text-lg text-red-600">
            ${Number(invoice.balance).toLocaleString()}
          </p>
        </div>

      </div>

      {/* PERIOD */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="font-semibold mb-3">Billing Period</h2>

        <p className="text-gray-600">
          {new Date(invoice.period_start).toLocaleDateString("en-GB")} –{" "}
          {new Date(invoice.period_end).toLocaleDateString("en-GB")}
        </p>

        <p className="text-gray-600 mt-2">
          Type: <strong>{invoice.type}</strong>
        </p>
      </div>

      {/* ALLOCATIONS */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-semibold">Payment Allocations</h2>
        </div>

        {allocations.length === 0 ? (
          <div className="p-6 text-gray-500">
            No allocations recorded.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Payment No</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-left">Amount</th>
              </tr>
            </thead>

            <tbody>
              {allocations.map((a) => (
                <tr key={a.id} className="border-t"
                onClick={() => navigate(`/manager/payments/${a.payment}`)}>
                  <td className="p-4 font-medium">{a.payment_no}</td>
                  <td className="p-4">
                    {new Date(a.payment_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">{a.method}</td>
                  <td className="p-4 font-semibold">
                    ${Number(a.allocation_amount).toLocaleString()}
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