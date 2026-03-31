import { useParams, useNavigate } from "react-router-dom";
import { Building2, Calendar, DollarSign } from "lucide-react";

import leases from "../../data/leases.json";
import tenants from "../../data/tenants.json";
import units from "../../data/units.json";

import {
  getTenantInvoices,
  getInvoicePaidAmount,
  getInvoiceBalance,
  getInvoiceStatus
} from "../../utils/tenantSelectors";

function LeaseDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const lease = leases.find(l => l.id === Number(id));

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

  const tenant = tenants.find(t => t.id === lease.tenant_id);
  const unit = units.find(u => u.id === lease.unit_id);

  // Pull only invoices tied to this lease
  const invoices = getTenantInvoices(lease.tenant_id)
    .filter(inv => inv.lease_id === lease.id);

  // Financial aggregates
  const totalInvoiced = invoices.reduce((s, i) => s + i.total_amount, 0);

  const totalPaid = invoices.reduce(
    (s, i) => s + getInvoicePaidAmount(i.id),
    0
  );

  const balance = totalInvoiced - totalPaid;

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
            {tenant?.company_name} • {unit?.name || `Unit ${lease.unit_id}`}
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

        <Card
          label="Start Date"
          value={new Date(lease.start_date).toLocaleDateString("en-GB")}
        />

        <Card
          label="End Date"
          value={new Date(lease.end_date).toLocaleDateString("en-GB")}
        />

        <Card
          label="Monthly Rent"
          value={`$${lease.rent_amount.toLocaleString()}`}
        />

        <Card
          label="Deposit"
          value={`$${lease.deposit_amount.toLocaleString()}`}
        />

      </div>

      {/* BILLING INFO */}
      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="font-semibold mb-3">
          Billing Details
        </h2>

        <div className="grid md:grid-cols-3 gap-4 text-gray-700">

          <div>
            <p className="text-sm text-gray-500">Billing Day</p>
            <p className="font-semibold">{lease.billing_day}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Unit</p>
            <p className="font-semibold">
              {unit?.name || lease.unit_id}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Tenant</p>
            <p className="font-semibold">
              {tenant?.company_name}
            </p>
          </div>

        </div>

      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card
          label="Total Invoiced"
          value={`$${totalInvoiced.toLocaleString()}`}
        />

        <Card
          label="Total Paid"
          value={`$${totalPaid.toLocaleString()}`}
        />

        <Card
          label="Outstanding"
          value={`$${balance.toLocaleString()}`}
          highlight="text-red-600"
        />

      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="font-semibold">
            Lease Invoices
          </h2>
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

              {invoices.map(inv => {

                const paid = getInvoicePaidAmount(inv.id);
                const bal = getInvoiceBalance(inv.id);
                const status = getInvoiceStatus(inv.id);

                return (
                  <tr key={inv.id} className="border-t">

                    <td className="p-4">{inv.invoice_no}</td>

                    <td className="p-4">
                      ${inv.total_amount.toLocaleString()}
                    </td>

                    <td className="p-4">
                      ${paid.toLocaleString()}
                    </td>

                    <td className="p-4">
                      ${bal.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {status}
                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

/* Reusable Card */
const Card = ({ label, value, highlight }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`font-semibold text-lg ${highlight || ""}`}>
      {value}
    </p>
  </div>
);

export default LeaseDetail;