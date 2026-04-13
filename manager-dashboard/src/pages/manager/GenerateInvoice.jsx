import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { getTenants, getTenantLeases, createInvoice } from "../../api/api";

function GenerateInvoice() {

  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  /* ---------------- LOAD TENANTS ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getTenants();
        setTenants(res);
      } catch (e) {
        setError("Failed to load tenants");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- LOAD LEASES (FIXED FILTER RELIABILITY) ---------------- */
  useEffect(() => {
    const loadLeases = async () => {

      if (!formData.tenant_id) {
        setLeases([]);
        return;
      }

      try {
        const res = await getTenantLeases(formData.tenant_id);

        // defensive cleanup: ensure only valid tenant leases
        const filtered = res.filter(
          l => Number(l.tenant) === Number(formData.tenant_id)
        );

        setLeases(filtered);

        // auto-assign lease_id if only one exists
        if (filtered.length === 1) {
          setFormData(prev => ({
            ...prev,
            lease_id: filtered[0].id
          }));
        }

      } catch (e) {
        setError("Failed to load leases");
      }

    };

    loadLeases();

  }, [formData.tenant_id]);

  /* ---------------- ACTIVE LEASE (SOURCE OF TRUTH FIXED) ---------------- */
  const activeLease = useMemo(() => {
    if (!leases.length) return null;

    return (
      leases.find(l => l.status === "Active") ||
      leases[0] ||
      null
    );
  }, [leases]);

  /* ---------------- FORM HANDLER ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!activeLease) {
      setError("No valid lease found for this tenant");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        tenant: Number(formData.tenant_id),
        lease: activeLease.id,
        type: formData.type,
        period_start: formData.period_start,
        period_end: formData.period_end,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        total_amount: Number(formData.total_amount)
      };

      await createInvoice(payload);

      navigate("/manager/invoices");

    } catch (e) {
      setError(e?.response?.data?.error || "Invoice creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const canGenerate =
    formData.tenant_id &&
    formData.period_start &&
    formData.period_end &&
    formData.issue_date &&
    formData.due_date &&
    formData.total_amount &&
    !submitting;

  /* ---------------- UI (LABELS PRESERVED EXACTLY) ---------------- */
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

      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-xl p-6">

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tenant */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Tenant</label>

              <select
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                className="border p-3 rounded-lg"
              >
                <option value="">Select Tenant</option>

                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.company_name}
                  </option>
                ))}

              </select>
            </div>

            {/* Lease */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Active Lease</label>

              <input
                value={activeLease ? activeLease.lease_number : "No active lease"}
                disabled
                className="border p-3 rounded-lg bg-gray-50"
              />
            </div>

            {/* Invoice Type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Invoice Type</label>

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
                value={formData.total_amount}
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">

            <button
              type="button"
              onClick={() => navigate("/manager/invoices")}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canGenerate}
              className={`px-5 py-2 rounded-lg text-white ${
                canGenerate
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400"
              }`}
            >
              {submitting ? "Generating..." : "Generate Invoice"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default GenerateInvoice;