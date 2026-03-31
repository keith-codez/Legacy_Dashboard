import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  AlertTriangle,
  FileText,
  PlusCircle,
  CreditCard,
  Home
} from "lucide-react";

import tenants from "../../data/tenants.json";
import leases from "../../data/leases.json";

import {
  getTenantTotalInvoiced,
  getTenantTotalPaid,
  getTenantBalance
} from "../../utils/tenantSelectors";

export default function Dashboard() {

  const navigate = useNavigate();

  /* ---------------- CORE METRICS ---------------- */

  const totalTenants = tenants.length;

  const activeLeases = leases.filter(l => l.status === "Active").length;

  const totalInvoiced = useMemo(() => {
    return tenants.reduce(
      (sum, t) => sum + getTenantTotalInvoiced(t.id),
      0
    );
  }, []);

  const totalPaid = useMemo(() => {
    return tenants.reduce(
      (sum, t) => sum + getTenantTotalPaid(t.id),
      0
    );
  }, []);

  const outstanding = useMemo(() => {
    return tenants.reduce(
      (sum, t) => sum + getTenantBalance(t.id),
      0
    );
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 md:p-8 space-y-8">



      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Stat
          icon={<Users />}
          label="Total Tenants"
          value={totalTenants}
        />

        <Stat
          icon={<Home />}
          label="Active Leases"
          value={activeLeases}
        />

        <Stat
          icon={<DollarSign />}
          label="Total Invoiced"
          value={`$${totalInvoiced.toLocaleString()}`}
        />

        <Stat
          icon={<AlertTriangle />}
          label="Outstanding"
          value={`$${outstanding.toLocaleString()}`}
          highlight
        />

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <Action
            icon={<PlusCircle />}
            label="Add Tenant"
            onClick={() => navigate("/tenants/new")}
          />

          <Action
            icon={<Home />}
            label="Add Unit"
            onClick={() => navigate("/units/new")}
          />

          <Action
            icon={<FileText />}
            label="Generate Invoice"
            onClick={() => navigate("/invoices/generate")}
          />

          <Action
            icon={<CreditCard />}
            label="Record Payment"
            onClick={() => navigate("/payments/new")}
          />

          <Action
            icon={<DollarSign />}
            label="Record Transaction"
            onClick={() => navigate("/transactions/new")}
          />

          <Action
            icon={<FileText />}
            label="View Invoices"
            onClick={() => navigate("/invoices")}
          />

        </div>

      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-6">

        <Card
          label="Total Paid"
          value={`$${totalPaid.toLocaleString()}`}
        />

        <Card
          label="Collection Rate"
          value={
            totalInvoiced
              ? `${Math.round((totalPaid / totalInvoiced) * 100)}%`
              : "0%"
          }
        />

        <Card
          label="Arrears Ratio"
          value={
            totalInvoiced
              ? `${Math.round((outstanding / totalInvoiced) * 100)}%`
              : "0%"
          }
          highlight
        />

      </div>

      {/* NAV SHORTCUTS */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-lg font-semibold mb-4">
          Navigation
        </h2>

        <div className="flex flex-wrap gap-3">

          <NavButton label="Tenants" onClick={() => navigate("/tenants")} />
          <NavButton label="Leases" onClick={() => navigate("/leases")} />
          <NavButton label="Units" onClick={() => navigate("/units")} />
          <NavButton label="Payments" onClick={() => navigate("/payments")} />
          <NavButton label="Reports" onClick={() => navigate("/reports")} />

        </div>

      </div>

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Stat = ({ icon, label, value, highlight }) => (
  <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4">
    <div className="p-3 bg-gray-100 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-red-600" : ""}`}>
        {value}
      </p>
    </div>
  </div>
);

const Action = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Card = ({ label, value, highlight }) => (
  <div className="bg-white shadow rounded-xl p-5">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`text-2xl font-bold ${highlight ? "text-red-600" : ""}`}>
      {value}
    </p>
  </div>
);

const NavButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
  >
    {label}
  </button>
);