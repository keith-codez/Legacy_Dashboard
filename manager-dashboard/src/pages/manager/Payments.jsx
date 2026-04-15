import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";

import { getPayments } from "../../api/api";

function PaymentsList() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPayments();
        setPayments(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- SORT ---------------- */
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

  /* ---------------- FILTER ---------------- */
  const filteredPayments = sortedPayments.filter((p) => {
    const q = searchQuery.toLowerCase();

    return (
      p.payment_no?.toLowerCase().includes(q) ||
      p.tenant_name?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q)
    );
  });

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending"
      ? <ArrowUp className="inline w-4 h-4 ml-1" />
      : <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  /* ---------------- STATES ---------------- */
  if (loading) return <div className="p-6">Loading payments...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow sticky top-0 z-20">
        <h2 className="text-2xl font-bold">Payments</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search payments..."
            className="border px-4 py-2 rounded-lg w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/payments/new")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">

        {/* Desktop */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100 text-sm font-semibold">
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
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/manager/payments/${p.id}`)}
                >
                  <td className="p-4 font-medium">{p.payment_no}</td>
                  <td className="p-4">{p.tenant_name}</td>
                  <td className="p-4">
                    {new Date(p.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4 font-semibold text-green-600">
                    ${Number(p.amount).toLocaleString()}
                  </td>
                  <td className="p-4">{p.method}</td>
                  <td className="p-4">{p.reference}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate(`/manager/payments/${p.id}`)}
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

        {/* Mobile */}
        <div className="md:hidden space-y-4">
          {filteredPayments.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow rounded-xl p-4 relative"
            >
              {/* Top row */}
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{p.payment_no}</h3>

                {/* 3 DOT MENU */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === p.id ? null : p.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* DROPDOWN */}
                  {menuOpen === p.id && (
                    <div
                      className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          navigate(`/manager/payments/${p.id}`);
                          setMenuOpen(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <p className="mt-2 text-green-600 font-bold">
                ${Number(p.amount).toLocaleString()}
              </p>

              {/* Details */}
              <div className="mt-2 text-sm space-y-1">
                <p><strong>Tenant:</strong> {p.tenant_name}</p>
                <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString("en-GB")}</p>
                <p><strong>Method:</strong> {p.method}</p>
                <p><strong>Reference:</strong> {p.reference}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default PaymentsList;