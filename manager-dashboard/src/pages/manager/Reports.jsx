import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import tenants from "../../data/tenants.json";
import { getTenantStatus } from "../../utils/tenantSelectors";

import units from "../../data/units.json";
import invoices from "../../data/invoices.json";
import allocations from "../../data/payment_allocations.json";

import RevenueTrend from "../../components/RevenueTrend";
import OccupancyTrend from "../../components/OccupancyTrend"; // placeholder for second trend chart

function Reports() {
  const navigate = useNavigate();

  const [selectedTenant, setSelectedTenant] = useState("all");
  const [period, setPeriod] = useState(new Date("2025-02-01")); // use Date object for react-datepicker

  /*
  ========================
  Portfolio Metrics
  ========================
  */

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total_amount, 0);
  const totalCollected = allocations.reduce((sum, a) => sum + a.allocation_amount, 0);
  const outstanding = totalInvoiced - totalCollected;

  const activeTenants = getTenantStatus(t => t.status === "Active").length;
  const occupiedUnits = units.filter(u => u.status === "Occupied").length;
  const occupancyRate = Math.round((occupiedUnits / units.length) * 100);

  /*
  ========================
  Tenant Statements
  ========================
  */

  const tenantStatements = useMemo(() => {
    return tenants.map(t => {
      const tenantInvoices = invoices.filter(i => i.tenant_id === t.id);
      const invoiced = tenantInvoices.reduce((sum, i) => sum + i.total_amount, 0);
      const tenantAllocations = allocations.filter(a => tenantInvoices.some(i => i.id === a.invoice_id));
      const paid = tenantAllocations.reduce((sum, a) => sum + a.allocation_amount, 0);
      const balance = invoiced - paid;

      return {
        tenant: t.company_name,
        tenant_id: t.id,
        invoiced,
        paid,
        balance
      };
    });
  }, []);

  const filteredStatements =
    selectedTenant === "all"
      ? tenantStatements
      : tenantStatements.filter(s => s.tenant_id === Number(selectedTenant));

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statements & Reports</h1>
          <p className="text-gray-500">Financial overview and tenant statements</p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <Download className="w-4 h-4"/>
          Export Portfolio Report
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3 w-fit cursor-pointer">
        <Calendar className="w-4 h-4 text-gray-500 pointer-events-none"/>
        <DatePicker
          selected={period}
          onChange={(date) => setPeriod(date)}
          dateFormat="yyyy-MM"
          showMonthYearPicker
          className="outline-none border rounded px-2 py-1"
        />
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Invoiced</p>
          <p className="text-lg font-bold">${totalInvoiced.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-lg font-bold text-green-600">${totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-lg font-bold text-red-600">${outstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Active Tenants</p>
          <p className="text-lg font-bold">{activeTenants}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Occupancy</p>
          <p className="text-lg font-bold">{occupancyRate}%</p>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueTrend />
        <OccupancyTrend /> {/* second trend chart placeholder */}
      </div>

      {/* Tenant Statements Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        {/* Section Header */}
        <div className="p-4 border-b flex flex-col md:flex-row justify-between gap-4">
          <h2 className="font-semibold">Tenant Statements</h2>
          <div className="flex gap-3">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="all">All Tenants</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.company_name}</option>
              ))}
            </select>

            <button className="text-blue-600 text-sm hover:underline">
              Export Statements
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Tenant</th>
                <th className="p-4 text-left">Invoiced</th>
                <th className="p-4 text-left">Paid</th>
                <th className="p-4 text-left">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatements.map((s, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td
                    onClick={() => navigate(`/manager/statements/${s.tenant_id}`)}
                    className="p-4 font-medium text-blue-600 cursor-pointer hover:underline"
                  >
                    {s.tenant}
                  </td>
                  <td className="p-4">${s.invoiced.toLocaleString()}</td>
                  <td className="p-4 text-green-600">${s.paid.toLocaleString()}</td>
                  <td className="p-4 text-red-600 font-semibold">${s.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default Reports;