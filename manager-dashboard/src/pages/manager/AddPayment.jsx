import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTenants,
  getOutstandingInvoices,
  createPayment
} from "../../api/api";

function AddPayment() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);

  const [formData, setFormData] = useState({
    tenant_id: "",
    amount: "",
    date: "",
    method: "Bank Transfer",
    reference: "",
    receipt_no: "",
    captured_by: "Admin"
  });

  const [allocations, setAllocations] = useState({});

  /* ---------------- LOAD TENANTS ---------------- */
  useEffect(() => {
    getTenants().then(setTenants);
  }, []);

  /* ---------------- LOAD INVOICES ON TENANT SELECT ---------------- */
  useEffect(() => {
    if (!formData.tenant_id) {
      setOutstandingInvoices([]);
      return;
    }

    getOutstandingInvoices(formData.tenant_id)
      .then(setOutstandingInvoices)
      .catch(console.error);

  }, [formData.tenant_id]);

  const paymentAmount = Number(formData.amount || 0);

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
  }, [allocations]);

  const remaining = paymentAmount - totalAllocated;

  const canSave =
    formData.tenant_id &&
    paymentAmount > 0 &&
    remaining === 0;

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllocationChange = (invoiceId, value, balance) => {
    const numeric = Number(value);

    if (numeric < 0) return;
    if (numeric > balance) return;

    const newAllocations = {
      ...allocations,
      [invoiceId]: numeric
    };

    const newTotal = Object.values(newAllocations)
      .reduce((sum, val) => sum + Number(val || 0), 0);

    if (newTotal > paymentAmount) return;

    setAllocations(newAllocations);
  };

  const handleAutoAllocate = () => {
    let remainingAmount = paymentAmount;
    const auto = {};

    for (const inv of outstandingInvoices) {
      if (remainingAmount <= 0) break;

      const balance = Number(inv.balance);

      const allocate = Math.min(balance, remainingAmount);

      auto[inv.id] = allocate;
      remainingAmount -= allocate;
    }

    setAllocations(auto);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSave) return;

    const payload = {
      tenant: formData.tenant_id,
      amount: paymentAmount,
      date: formData.date,
      method: formData.method,
      reference: formData.reference,
      receipt_no: formData.receipt_no,
      captured_by: formData.captured_by,

      allocations: Object.entries(allocations).map(([invoiceId, amount]) => ({
        invoice_id: Number(invoiceId),
        amount: Number(amount)
      }))
    };

    try {
      await createPayment(payload);
      navigate("/manager/payments");
    } catch (err) {
      console.error(err);
      alert("Failed to save payment");
    }
  };

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-8">Record Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <select
            name="tenant_id"
            value={formData.tenant_id}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          >
            <option value="">Select Tenant</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.company_name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Payment Amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border p-3 rounded-lg"
          />

          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option>Bank Transfer</option>
            <option>Cash</option>
            <option>Ecocash</option>
          </select>

          <input
            type="text"
            name="reference"
            placeholder="Reference"
            value={formData.reference}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            name="receipt_no"
            placeholder="Receipt Number"
            value={formData.receipt_no}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

        </div>

        {formData.tenant_id && (
          <div className="border-t pt-8">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Allocate Payment to Invoices
              </h3>

              <button
                type="button"
                onClick={handleAutoAllocate}
                className="text-blue-600 hover:underline text-sm"
              >
                Auto Allocate Oldest First
              </button>
            </div>

            {outstandingInvoices.length === 0 ? (
              <p className="text-gray-500">
                No outstanding invoices for this tenant.
              </p>
            ) : (
              <div className="space-y-4">

                {outstandingInvoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-gray-50 p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {invoice.invoice_no}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                      </p>
                    </div>

                    <div className="font-semibold text-red-600">
                      Balance: ${Number(invoice.balance).toLocaleString()}
                    </div>

                    <div>
                      <input
                        type="number"
                        min="0"
                        max={invoice.balance}
                        value={allocations[invoice.id] || ""}
                        onChange={(e) =>
                          handleAllocationChange(
                            invoice.id,
                            e.target.value,
                            invoice.balance
                          )
                        }
                        placeholder="Allocate"
                        className="w-full border p-2 rounded-lg"
                      />
                    </div>

                    <div className="text-sm text-gray-500">
                      Max: ${Number(invoice.balance).toLocaleString()}
                    </div>
                  </div>
                ))}

              </div>
            )}

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between">
                <span>Payment Amount:</span>
                <span className="font-semibold">
                  ${paymentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Allocated:</span>
                <span className="font-semibold">
                  ${totalAllocated.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className={`font-semibold ${remaining === 0 ? "text-green-600" : "text-red-600"}`}>
                  ${remaining.toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/manager/payments")}
            className="px-6 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSave}
            className={`px-6 py-2 rounded-lg text-white ${
              canSave
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save Payment
          </button>
        </div>

      </form>
    </div>
  );
}

export default AddPayment;