import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Banknote,
  Home,
  Activity
} from "lucide-react";

import { getDashboard } from "../../api/api";

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return <div className="p-6">Loading portfolio overview...</div>;

  const collectionRate = data.total_invoiced
    ? Math.round((data.total_paid / data.total_invoiced) * 100)
    : 0;

  const arrearsRatio = data.total_invoiced
    ? Math.round((data.outstanding / data.total_invoiced) * 100)
    : 0;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-full">

      {/* HEADER STRIP */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            Portfolio Overview
          </h1>
          <p className="text-sm text-gray-500">
            High-level performance snapshot
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Collection Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {collectionRate}%
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <KPI
          icon={<Users className="text-blue-600" />}
          label="Total Tenants"
          value={data.total_tenants}
        />

        <KPI
          icon={<Home className="text-indigo-600" />}
          label="Active Leases"
          value={data.active_leases}
        />

        <KPI
          icon={<Banknote className="text-emerald-600" />}
          label="Total Invoiced"
          value={`$${Number(data.total_invoiced).toLocaleString()}`}
        />

        <KPI
          icon={<AlertTriangle className="text-red-600" />}
          label="Outstanding Exposure"
          value={`$${Number(data.outstanding).toLocaleString()}`}
        />

      </div>

      {/* FINANCIAL INTELLIGENCE LAYER */}
      <div className="grid md:grid-cols-3 gap-6">

        <InsightCard
          icon={<TrendingUp className="text-green-600" />}
          label="Total Paid"
          value={`$${Number(data.total_paid).toLocaleString()}`}
          description="Cash inflow performance"
        />

        <InsightCard
          icon={<Activity className="text-blue-600" />}
          label="Collection Efficiency"
          value={`${collectionRate}%`}
          description="Revenue capture effectiveness"
        />

        <InsightCard
          icon={<AlertTriangle className="text-orange-600" />}
          label="Arrears Pressure"
          value={`${arrearsRatio}%`}
          description="Outstanding revenue risk"
        />

      </div>

      {/* STRATEGIC ACTION PANEL */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Strategic Controls</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Action
            label="View Tenants"
            icon={<Users />}
            onClick={() => navigate("/owner/tenants")}
          />

          <Action
            label="Lease Portfolio"
            icon={<Home />}
            onClick={() => navigate("/owner/leases")}
          />

          <Action
            label="Financial Reports"
            icon={<FileText />}
            onClick={() => navigate("/owner/reports")}
          />

          <Action
            label="Risk Exposure"
            icon={<AlertTriangle />}
            onClick={() => navigate("/owner/reports")}
          />

        </div>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

const KPI = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
    <div className="p-3 bg-gray-100 rounded-xl">
      {icon}
    </div>

    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const InsightCard = ({ icon, label, value, description }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2 hover:shadow-md transition">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {icon}
      {label}
    </div>

    <div className="text-2xl font-bold">{value}</div>

    <div className="text-xs text-gray-400">{description}</div>
  </div>
);

const Action = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
  >
    <div className="text-gray-700">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);