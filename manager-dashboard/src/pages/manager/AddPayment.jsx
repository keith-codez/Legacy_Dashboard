import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import tenantsData from "../../data/tenants.json";
import {
  getTenantOutstandingInvoices,
  getInvoiceBalance,
  autoAllocateInvoices
} from "../../utils/tenantSelectors";

function AddPayment() {
  const navigate = useNavigate();

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

  const paymentAmount = Number(formData.amount || 0);

  const outstandingInvoices = useMemo(() => {
    if (!formData.tenant_id) return [];
    return getTenantOutstandingInvoices(formData.tenant_id);
  }, [formData.tenant_id]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllocationChange = (invoiceId, value) => {
    const invoiceBalance = getInvoiceBalance(invoiceId);
    const numeric = Number(value);

    if (numeric < 0) return;
    if (numeric > invoiceBalance) return;

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
    if (!formData.tenant_id || paymentAmount <= 0) return;

    const auto = autoAllocateInvoices(
      formData.tenant_id,
      paymentAmount
    );

    setAllocations(auto);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canSave) return;

    const newPayment = {
      ...formData,
      amount: paymentAmount,
      allocations
    };

    console.log("Payment Created:", newPayment);

    navigate("/manager/payments");
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-8">Record Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

        {/* Allocation Section */}
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

                {outstandingInvoices.map(invoice => {
                  const balance = getInvoiceBalance(invoice.id);

                  return (
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
                        Balance: ${balance.toLocaleString()}
                      </div>

                      <div>
                        <input
                          type="number"
                          min="0"
                          max={balance}
                          value={allocations[invoice.id] || ""}
                          onChange={(e) =>
                            handleAllocationChange(
                              invoice.id,
                              e.target.value
                            )
                          }
                          placeholder="Allocate"
                          className="w-full border p-2 rounded-lg"
                        />
                      </div>

                      <div className="text-sm text-gray-500">
                        Max: ${balance.toLocaleString()}
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            {/* Summary */}
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
                <span
                  className={`font-semibold ${
                    remaining === 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${remaining.toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Actions */}
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