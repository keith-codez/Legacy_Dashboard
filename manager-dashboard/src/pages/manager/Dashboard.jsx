import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  AlertTriangle,
  FileText,
  PlusCircle,
  CreditCard,
  Home,
  NotebookPen
} from "lucide-react";

import API from "../../api/client"; // axios instance

export default function Dashboard() {

  const navigate = useNavigate();

  const [data, setData] = useState({
    total_tenants: 0,
    active_leases: 0,
    total_invoiced: 0,
    total_paid: 0,
    outstanding: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH DASHBOARD ---------------- */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const res = await API.get("/dashboard/");
        setData(res.data);

      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* ---------------- DERIVED METRICS ---------------- */

  const collectionRate = data.total_invoiced
    ? Math.round((data.total_paid / data.total_invoiced) * 100)
    : 0;

  const arrearsRatio = data.total_invoiced
    ? Math.round((data.outstanding / data.total_invoiced) * 100)
    : 0;

  /* ---------------- STATES ---------------- */

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 md:p-8 space-y-8">

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Stat
          icon={<Users />}
          label="Total Tenants"
          value={data.total_tenants}
        />

        <Stat
          icon={<Home />}
          label="Active Leases"
          value={data.active_leases}
        />

        <Stat
          icon={<DollarSign />}
          label="Total Invoiced"
          value={`$${data.total_invoiced.toLocaleString()}`}
        />

        <Stat
          icon={<AlertTriangle />}
          label="Outstanding"
          value={`$${data.outstanding.toLocaleString()}`}
          highlight
        />

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <Action icon={<PlusCircle />} label="Add Tenant" onClick={() => navigate("/manager/tenants/new")} />
          <Action icon={<Home />} label="Add Unit" onClick={() => navigate("/manager/units/new")} />
          <Action icon={<FileText />} label="Generate Invoice" onClick={() => navigate("/manager/invoices/generate")} />
          <Action icon={<CreditCard />} label="Record Payment" onClick={() => navigate("/manager/payments/new")} />
          <Action icon={<NotebookPen />} label="Record Interaction" onClick={() => navigate("/manager/interactions/new")} />
          <Action icon={<FileText />} label="View Invoices" onClick={() => navigate("/manager/invoices")} />

        </div>

      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-6">

        <Card
          label="Total Paid"
          value={`$${data.total_paid.toLocaleString()}`}
        />

        <Card
          label="Collection Rate"
          value={`${collectionRate}%`}
        />

        <Card
          label="Arrears Ratio"
          value={`${arrearsRatio}%`}
          highlight
        />

      </div>

      {/* NAVIGATION */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-lg font-semibold mb-4">
          Navigation
        </h2>

        <div className="flex flex-wrap gap-3">
          <NavButton label="Tenants" onClick={() => navigate("/manager/tenants")} />
          <NavButton label="Leases" onClick={() => navigate("/manager/leases")} />
          <NavButton label="Units" onClick={() => navigate("/manager/units")} />
          <NavButton label="Payments" onClick={() => navigate("/manager/payments")} />
          <NavButton label="Reports" onClick={() => navigate("/manager/reports")} />
        </div>

      </div>

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Stat = ({ icon, label, value, highlight }) => (
  <div className="bg-white p-5 rounded-2xl shadow flex items-center gap-4">
    <div className="p-3 bg-gray-100 rounded-xl">{icon}</div>
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