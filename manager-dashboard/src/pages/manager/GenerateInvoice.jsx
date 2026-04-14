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
      } catch {
        setError("Failed to load tenants");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- LOAD LEASES ---------------- */
  useEffect(() => {
    const loadLeases = async () => {
      if (!formData.tenant_id) {
        setLeases([]);
        setFormData(prev => ({ ...prev, lease_id: "" }));
        return;
      }

      try {
        const res = await getTenantLeases(formData.tenant_id);

        const filtered = res.filter(
          l => Number(l.tenant) === Number(formData.tenant_id)
        );

        setLeases(filtered);

        // auto-select first lease only if none selected
        if (filtered.length === 1) {
          setFormData(prev => ({
            ...prev,
            lease_id: String(filtered[0].id)
          }));
        } else {
          setFormData(prev => ({ ...prev, lease_id: "" }));
        }

      } catch {
        setError("Failed to load leases");
      }
    };

    loadLeases();
  }, [formData.tenant_id]);

  /* ---------------- SELECTED LEASE ---------------- */
  const selectedLease = useMemo(() => {
    return leases.find(l => l.id === Number(formData.lease_id)) || null;
  }, [leases, formData.lease_id]);

  /* ---------------- AUTO AMOUNT ENGINE ---------------- */
  const computedAmount = useMemo(() => {
    if (!selectedLease) return 0;

    if (formData.type === "Deposit") {
      return Number(selectedLease.deposit_amount);
    }

    return Number(selectedLease.rent_amount);
  }, [selectedLease, formData.type]);

  useEffect(() => {
    if (selectedLease) {
      setFormData(prev => ({
        ...prev,
        total_amount: computedAmount
      }));
    }
  }, [computedAmount]);

  /* ---------------- HANDLER ---------------- */
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

    if (!formData.tenant_id) return setError("Select tenant");
    if (!formData.lease_id) return setError("Select lease");

    try {
      setSubmitting(true);

      const payload = {
        tenant: Number(formData.tenant_id),
        lease: Number(formData.lease_id),
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
    formData.lease_id &&
    formData.period_start &&
    formData.period_end &&
    formData.issue_date &&
    formData.due_date &&
    formData.total_amount &&
    !submitting;

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Generate Invoice</h1>
        <p className="text-gray-500 text-sm">
          Select tenant and lease to generate structured billing.
        </p>
      </div>

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
              <label className="text-sm font-medium mb-1">Lease</label>
              <select
                name="lease_id"
                value={formData.lease_id}
                onChange={handleChange}
                className="border p-3 rounded-lg"
                disabled={!leases.length}
              >
                <option value="">Select Lease</option>

                {leases.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.lease_number} — {l.unit_no} ({l.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Invoice Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border p-3 rounded-lg"
              >
                <option>Rent</option>
                <option>Deposit</option>
                <option>Utilities</option>
                <option>Service Charge</option>
              </select>
            </div>

            {/* Period Start */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Billing Start</label>
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
              <label className="text-sm font-medium mb-1">Billing End</label>
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
              <label className="text-sm font-medium mb-1">Issue Date</label>
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
              <label className="text-sm font-medium mb-1">Due Date</label>
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
              <label className="text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated from lease ({formData.type})
              </p>
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
                canGenerate ? "bg-green-600" : "bg-gray-400"
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