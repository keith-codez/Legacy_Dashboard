import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getPaymentDetails } from "../../api/api";

function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [allocations, setAllocations] = useState([]);

  const [totalAllocated, setTotalAllocated] = useState(0);
  const [unallocated, setUnallocated] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await getPaymentDetails(id);

        setPayment(data.payment);
        setTenant(data.tenant);
        setAllocations(data.allocations);

        setTotalAllocated(Number(data.total_allocated));
        setUnallocated(Number(data.unallocated));

      } catch (err) {
        console.error(err);
        setError("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------- STATES ---------------- */

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!payment) return <div className="p-6">Payment not found</div>;

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{payment.payment_no}</h1>
          <p className="text-gray-500">{tenant?.company_name || "—"}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
      </div>

      {/* META */}
      <div className="bg-white shadow rounded-lg p-6 grid md:grid-cols-2 gap-6">

        <Meta label="Method" value={payment.method} />
        <Meta label="Reference" value={payment.reference} />
        <Meta label="Captured By" value={payment.captured_by || "System"} />

        <Meta
          label="Payment Date"
          value={new Date(payment.date).toLocaleDateString("en-GB")}
        />

      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">

        <Card
          label="Amount Paid"
          value={`$${Number(payment.amount).toLocaleString()}`}
          green
        />

        <Card
          label="Allocated"
          value={`$${Number(totalAllocated).toLocaleString()}`}
          blue
        />

        <Card
          label="Unallocated"
          value={`$${Number(unallocated).toLocaleString()}`}
          red
        />

      </div>

      {/* INVOICES */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-semibold">Invoice Allocations</h2>
        </div>

        {allocations.length === 0 ? (
          <div className="p-6 text-gray-500">
            No allocations yet.
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
              {allocations.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/manager/invoices/${inv.invoice_id}`)
                  }
                >
                  <td className="p-4 text-blue-600 underline">
                    {inv.invoice_no}
                  </td>

                  <td className="p-4">
                    {inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>

                  <td className="p-4">{inv.status}</td>

                  <td className="p-4 font-semibold">
                    ${Number(inv.allocated_amount).toLocaleString()}
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

/* ---------------- COMPONENTS ---------------- */

const Meta = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-semibold">{value || "—"}</p>
  </div>
);

const Card = ({ label, value, green, blue, red }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <p className="text-gray-500 text-sm">{label}</p>
    <p
      className={`font-semibold text-lg ${
        green
          ? "text-green-600"
          : blue
          ? "text-blue-600"
          : red
          ? "text-red-600"
          : ""
      }`}
    >
      {value}
    </p>
  </div>
);

export default PaymentDetail;