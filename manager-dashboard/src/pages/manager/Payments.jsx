import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import paymentsData from "../../data/payments.json";
import tenantsData from "../../data/tenants.json";

function PaymentsList() {
  const navigate = useNavigate();
  const [payments] = useState(paymentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });
  const [menuOpen, setMenuOpen] = useState(null);

  const tenantMap = useMemo(() => {
    const map = {};
    tenantsData.forEach(t => map[t.id] = t.company_name);
    return map;
  }, []);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [payments, sortConfig]);

  const filteredPayments = sortedPayments.filter((payment) => {
    const query = searchQuery.toLowerCase();
    return (
      payment.payment_no.toLowerCase().includes(query) ||
      tenantMap[payment.tenant_id]?.toLowerCase().includes(query) ||
      payment.method.toLowerCase().includes(query) ||
      payment.reference.toLowerCase().includes(query)
    );
  });

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending"
      ? <ArrowUp className="inline w-4 h-4 ml-1" />
      : <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow sticky top-0 z-20">
        <h2 className="text-2xl font-bold">Payments</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search payments..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/payments/new")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100 text-left text-sm font-semibold">
              <tr>
                <th onClick={() => handleSort("payment_no")} className="p-4 cursor-pointer">
                  Payment {renderSortArrow("payment_no")}
                </th>
                <th className="p-4">Tenant</th>
                <th onClick={() => handleSort("date")} className="p-4 cursor-pointer">
                  Date {renderSortArrow("date")}
                </th>
                <th onClick={() => handleSort("amount")} className="p-4 cursor-pointer">
                  Amount {renderSortArrow("amount")}
                </th>
                <th className="p-4">Method</th>
                <th className="p-4">Reference</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{payment.payment_no}</td>
                  <td className="p-4">{tenantMap[payment.tenant_id]}</td>
                  <td className="p-4">
                    {new Date(payment.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4 font-semibold text-green-600">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="p-4">{payment.method}</td>
                  <td className="p-4">{payment.reference}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate(`/manager/payments/${payment.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white shadow rounded-xl p-4"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{payment.payment_no}</h3>
                <span className="text-green-600 font-bold">
                  ${payment.amount.toLocaleString()}
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><strong>Tenant:</strong> {tenantMap[payment.tenant_id]}</p>
                <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString("en-GB")}</p>
                <p><strong>Method:</strong> {payment.method}</p>
                <p><strong>Reference:</strong> {payment.reference}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default PaymentsList;