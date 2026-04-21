import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download, MoreVertical } from "lucide-react";

import {
  getReports,
  getDashboard,
  getTenants,
  exportPortfolio,
  exportStatements,
} from "../../api/api";

import RevenueTrend from "../../components/RevenueTrend";
import TenantOutstandingChart from "../../components/TenantOutstandingChart";

function Reports() {
  const navigate = useNavigate();

  const [selectedTenant, setSelectedTenant] = useState("all");

  const [dashboard, setDashboard] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [reportData, setReportData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);

  /* ---------------- DATA LOAD ---------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [dash, tenantList, reports] = await Promise.all([
        getDashboard(),
        getTenants(),
        getReports(selectedTenant),
      ]);

      setDashboard(dash);
      setTenants(tenantList);
      setReportData(Array.isArray(reports) ? reports : []);

      setLoading(false);
    };

    load();
  }, [selectedTenant]);

  /* ---------------- FILTER ---------------- */
  const filteredData = useMemo(() => {
    if (selectedTenant === "all") return reportData;

    return reportData.filter(
      (r) => r.tenant_id === Number(selectedTenant)
    );
  }, [reportData, selectedTenant]);

  /* ---------------- DOWNLOAD HELPER ---------------- */
  const downloadPDF = (data, filename) => {
    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  /* ---------------- EXPORT PORTFOLIO ---------------- */
  const handleExportPortfolio = async () => {
    try {
      const res = await exportPortfolio();
      downloadPDF(res.data, `portfolio_report.pdf`);
    } catch (err) {
      console.error("Portfolio export failed", err);
    }
  };

  /* ---------------- EXPORT TENANT ---------------- */
  const handleExportTenant = async (tenantId) => {
    try {
      const res = await exportStatements(tenantId);
      downloadPDF(res.data, `statement_${tenantId}.pdf`);
    } catch (err) {
      console.error("Statement export failed", err);
    }
  };

  /* ---------------- EXPORT ALL ---------------- */
  const handleExportAll = async () => {
    try {
      const res = await exportStatements(
        selectedTenant === "all" ? null : selectedTenant
      );
      downloadPDF(res.data, `tenant_statements.pdf`);
    } catch (err) {
      console.error("Export all failed", err);
    }
  };

  const toggleMenu = (tenantId) => {
    setMenuOpen(menuOpen === tenantId ? null : tenantId);
  };

  if (loading || !dashboard) {
    return <div className="p-6">Loading reports...</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statements & Reports</h1>
          <p className="text-gray-500">
            Financial intelligence dashboard
          </p>
        </div>

        <button
          onClick={handleExportPortfolio}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Download className="w-4 h-4" />
          Export Portfolio Report
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Metric label="Total Invoiced" value={dashboard.total_invoiced} />
        <Metric label="Collected" value={dashboard.total_paid} green />
        <Metric label="Outstanding" value={dashboard.outstanding} red />
        <Metric label="Active Tenants" value={dashboard.total_tenants} />
        <Metric label="Collection Rate" value={`${dashboard.collection_rate}%`} />
      </div>

      {/* TREND CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueTrend />
        <TenantOutstandingChart />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <div className="p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <h2 className="font-semibold">Tenant Statements</h2>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="border px-2 py-2 rounded w-1/2 md:w-auto"
            >
              <option value="all">All Tenants</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.company_name}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportAll}
              className="bg-black text-white px-2 py-2 rounded w-1/2 md:w-auto whitespace-nowrap"
            >
              Export All
            </button>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Tenant</th>
                <th className="p-4">Invoiced</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4"></th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row) => (
                <tr key={row.tenant_id} className="border-t hover:bg-gray-50">

                  <td
                    className="p-4 text-blue-600 cursor-pointer"
                    onClick={() =>
                      navigate(`/manager/statements/${row.tenant_id}`)
                    }
                  >
                    {row.tenant}
                  </td>

                  <td className="p-4">${row.invoiced}</td>
                  <td className="p-4 text-green-600">${row.paid}</td>
                  <td className="p-4 text-red-600 font-semibold">
                    ${row.balance}
                  </td>

                  <td className="p-4 relative text-right">
                    <button onClick={() => toggleMenu(row.tenant_id)}>
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuOpen === row.tenant_id && (
                      <div className="absolute right-2 bottom-full mb-2 w-40 bg-white border shadow rounded z-50">

                        <button
                          onClick={() =>
                            navigate(`/manager/statements/${row.tenant_id}`)
                          }
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          View Statement
                        </button>

                        <button
                          onClick={() => handleExportTenant(row.tenant_id)}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          Export PDF
                        </button>

                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden divide-y">
          {filteredData.map((row) => (
            <MobileRow
              key={row.tenant_id}
              row={row}
              navigate={navigate}
              handleExportTenant={handleExportTenant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- KPI CARD ---------------- */
const Metric = ({ label, value, green, red }) => (
  <div className="bg-white shadow rounded p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p
      className={`text-lg font-bold ${
        green ? "text-green-600" : red ? "text-red-600" : ""
      }`}
    >
      {typeof value === "number"
        ? `$${value.toLocaleString()}`
        : value}
    </p>
  </div>
);

/* ---------------- MOBILE ROW ---------------- */
function MobileRow({ row, navigate, handleExportTenant }) {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="p-4">

      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => navigate(`/manager/statements/${row.tenant_id}`)}
      >
        <h3 className="text-blue-600 font-medium">{row.tenant}</h3>
      </div>

      <div className="flex gap-2 mt-3 text-sm">
        {["summary", "financials", "actions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded ${
              activeTab === tab
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-3 text-sm">

        {activeTab === "summary" && (
          <p><strong>Tenant:</strong> {row.tenant}</p>
        )}

        {activeTab === "financials" && (
          <div className="space-y-1">
            <p>Invoiced: ${row.invoiced}</p>
            <p className="text-green-600">Paid: ${row.paid}</p>
            <p className="text-red-600 font-semibold">
              Balance: ${row.balance}
            </p>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                navigate(`/manager/statements/${row.tenant_id}`)
              }
              className="text-left px-3 py-2 bg-gray-100 rounded"
            >
              View Statement
            </button>

            <button
              onClick={() => handleExportTenant(row.tenant_id)}
              className="text-left px-3 py-2 bg-gray-100 rounded"
            >
              Export PDF
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Reports;