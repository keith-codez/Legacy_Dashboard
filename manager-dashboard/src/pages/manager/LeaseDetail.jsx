import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLeaseDetails } from "../../api/api";

function LeaseDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [lease, setLease] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getLeaseDetails(id);

        setLease(data.lease);
        setInvoices(data.invoices);
        setSummary(data.summary);

      } catch (err) {
        console.error("Lease details load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;

  if (!lease) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Lease not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalInvoiced = summary?.total_invoiced || 0;
  const totalPaid = summary?.total_paid || 0;
  const balance = summary?.balance || 0;

  const statusStyles = {
    Active: "bg-green-100 text-green-700",
    Expired: "bg-gray-100 text-gray-700",
    Terminated: "bg-red-100 text-red-700"
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {lease.lease_number}
          </h1>

          <p className="text-gray-500">
            {lease.tenant_name} • {lease.unit_no}
          </p>
        </div>
      </div>

      {/* STATUS */}
      <div>
        <span className={`text-sm px-3 py-1 rounded-full ${statusStyles[lease.status]}`}>
          {lease.status}
        </span>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card label="Start Date" value={new Date(lease.start_date).toLocaleDateString("en-GB")} />
        <Card label="End Date" value={new Date(lease.end_date).toLocaleDateString("en-GB")} />
        <Card label="Monthly Rent" value={`$${Number(lease.rent_amount).toLocaleString()}`} />
        <Card label="Deposit" value={`$${Number(lease.deposit_amount).toLocaleString()}`} />
      </div>

      {/* BILLING INFO */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="font-semibold mb-3">Billing Details</h2>

        <div className="grid md:grid-cols-3 gap-4 text-gray-700">
          <div>
            <p className="text-sm text-gray-500">Billing Day</p>
            <p className="font-semibold">{lease.billing_day}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Unit</p>
            <p className="font-semibold">{lease.unit_no}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tenant</p>
            <p className="font-semibold">{lease.tenant_name}</p>
          </div>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Total Invoiced" value={`$${totalInvoiced.toLocaleString()}`} />
        <Card label="Total Paid" value={`$${totalPaid.toLocaleString()}`} />
        <Card label="Outstanding" value={`$${balance.toLocaleString()}`} highlight="text-red-600" />
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-semibold">Lease Invoices</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="p-6 text-gray-500">
            No invoices linked to this lease.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Invoice</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Paid</th>
                <th className="p-4 text-left">Balance</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/manager/invoices/${inv.id}`)}>
                  <td className="p-4">{inv.invoice_no}</td>
                  <td className="p-4">${Number(inv.total_amount).toLocaleString()}</td>
                  <td className="p-4">${Number(inv.paid_amount).toLocaleString()}</td>
                  <td className="p-4">${Number(inv.balance).toLocaleString()}</td>
                  <td className="p-4">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

const Card = ({ label, value, highlight }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`font-semibold text-lg ${highlight || ""}`}>
      {value}
    </p>
  </div>
);

export default LeaseDetail;