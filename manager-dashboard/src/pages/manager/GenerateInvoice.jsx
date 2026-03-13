import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { autoGenerateMonthlyInvoices } from "../../utils/invoiceGenerator";
import tenantsData from "../../data/tenants.json";

import {
  getTenantInvoices,
  getTenantLeases,
  getInvoiceBalance,
  getInvoiceStatus
} from "../../utils/tenantSelectors";

function GenerateInvoice() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tenant_id: "",
    lease_id: "",
    type: "Rent",
    period_start: "",
    period_end: "",
    issue_date: "",
    due_date: "",
    total_amount: ""
  });

  const handleAutoGenerate = () => {

    const invoices = autoGenerateMonthlyInvoices({
      period_start: "2025-03-01",
      period_end: "2025-03-31",
      issue_date: "2025-03-01",
      due_date: "2025-03-05",
      type: "Rent"
    });

    console.log("Auto Generated Invoices:", invoices);

  };

  const activeLease = useMemo(() => {

    if (!formData.tenant_id) return null;

    const leases = getTenantLeases(formData.tenant_id);

    return leases.find(l => l.status === "Active");

  }, [formData.tenant_id]);

  const tenantInvoices = useMemo(() => {

    if (!formData.tenant_id) return [];

    return getTenantInvoices(formData.tenant_id);

  }, [formData.tenant_id]);

  const duplicateInvoice = useMemo(() => {

    if (!formData.period_start || !formData.period_end || !formData.tenant_id)
      return null;

    return tenantInvoices.find(
      inv =>
        inv.type === formData.type &&
        inv.period_start === formData.period_start &&
        inv.period_end === formData.period_end
    );

  }, [
    tenantInvoices,
    formData.period_start,
    formData.period_end,
    formData.type,
    formData.tenant_id
  ]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (duplicateInvoice) return;

    const newInvoice = {
      tenant_id: Number(formData.tenant_id),
      lease_id: activeLease ? activeLease.id : null,
      type: formData.type,
      period_start: formData.period_start,
      period_end: formData.period_end,
      issue_date: formData.issue_date,
      due_date: formData.due_date,
      total_amount: Number(formData.total_amount)
    };

    console.log("Invoice Generated:", newInvoice);

    navigate("/manager/invoices");

  };

  const canGenerate =
    formData.tenant_id &&
    formData.period_start &&
    formData.period_end &&
    formData.issue_date &&
    formData.due_date &&
    formData.total_amount &&
    !duplicateInvoice;

  return (

    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold">Generate Invoice</h1>
          <p className="text-gray-500 text-sm">
            Create a tenant invoice or auto-generate monthly rent invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          Auto Generate Rent
        </button>

      </div>

      {/* Form */}

      <div className="bg-white shadow rounded-xl p-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tenant */}

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Tenant
              </label>
              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg"
              >
                <option value="">Select Tenant</option>

                {tenantsData.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.company_name}
                  </option>
                ))}

              </select>
            </div>

            {/* Invoice Type */}

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Invoice Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border p-3 rounded-lg"
              >
                <option>Rent</option>
                <option>Utilities</option>
                <option>Service Charge</option>
                <option>Maintenance</option>
              </select>
            </div>

            {/* Period Start */}

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Billing Period Start
              </label>
              <input
                type="date"
                name="period_start"
                value={formData.period_start}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg"
              />
            </div>

            {/* Period End */}

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Billing Period End
              </label>
              <input
                type="date"
                name="period_end"
                value={formData.period_end}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg"
              />
            </div>

            {/* Issue Date */}

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Invoice Issue Date
              </label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg"
              />
            </div>

            {/* Due Date */}

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg"
              />
            </div>

            {/* Amount */}

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium mb-1">
                Invoice Amount
              </label>
              <input
                type="number"
                name="total_amount"
                placeholder="Enter invoice amount"
                value={formData.total_amount}
                onChange={handleChange}
                required
                className="border p-3 rounded-lg"
              />
            </div>

          </div>

          {duplicateInvoice && (

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">

              Invoice already exists for this tenant and billing period.

              <div className="font-semibold mt-1">
                {duplicateInvoice.invoice_no}
              </div>

            </div>

          )}

          {/* Actions */}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">

            <button
              type="button"
              onClick={() => navigate("/manager/invoices")}
              className="px-5 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canGenerate}
              className={`px-5 py-2 rounded-lg text-white ${
                canGenerate
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Generate Invoice
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default GenerateInvoice;