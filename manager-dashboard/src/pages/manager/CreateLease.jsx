import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { createLease, getTenants, getUnits } from "../../api/api";

function CreateLease() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);

  const [form, setForm] = useState({
    tenant: "",
    unit: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
    deposit_amount: "",
    billing_day: 1,
    status: "Active",
  });

  useEffect(() => {
    getTenants().then(setTenants).catch(console.error);
    getUnits().then(setUnits).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const canSubmit =
    form.tenant &&
    form.unit &&
    form.start_date &&
    form.end_date &&
    form.rent_amount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const payload = {
        tenant: Number(form.tenant),
        unit: Number(form.unit),
        start_date: form.start_date,
        end_date: form.end_date,
        rent_amount: Number(form.rent_amount),
        deposit_amount: Number(form.deposit_amount || 0),
        billing_day: Number(form.billing_day),
        status: form.status,
      };

      await createLease(payload);

      navigate("/manager/leases");
    } catch (err) {
      console.error("Lease creation failed:", err);
      alert("Failed to create lease");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Create Lease</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid md:grid-cols-2 gap-4">

          {/* Tenant */}
          <div>
            <label className="text-sm text-gray-600">Tenant</label>
            <select
              name="tenant"
              value={form.tenant}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            >
              <option value="">Select Tenant</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="text-sm text-gray-600">Unit</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            >
              <option value="">Select Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.unit_no}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm text-gray-600">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm text-gray-600">End Date</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            />
          </div>

          {/* Rent */}
          <div>
            <label className="text-sm text-gray-600">Monthly Rent</label>
            <input
              type="number"
              name="rent_amount"
              value={form.rent_amount}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
              placeholder="e.g. 2500"
            />
          </div>

          {/* Deposit */}
          <div>
            <label className="text-sm text-gray-600">Deposit</label>
            <input
              type="number"
              name="deposit_amount"
              value={form.deposit_amount}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
              placeholder="e.g. 5000"
            />
          </div>

          {/* Billing Day */}
          <div>
            <label className="text-sm text-gray-600">Billing Day</label>
            <select
              name="billing_day"
              value={form.billing_day}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  Day {day}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-3 rounded-lg w-full"
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/manager/leases")}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-5 py-2 rounded-lg text-white ${
              canSubmit
                ? "bg-black hover:bg-gray-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Create Lease
          </button>
        </div>

      </form>
    </div>
  );
}

export default CreateLease;