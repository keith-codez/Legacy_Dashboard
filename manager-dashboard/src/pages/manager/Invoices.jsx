import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Download,
  Eye
} from "lucide-react";

import { getInvoices } from "../../api/api";

function InvoicesList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "issue_date",
    direction: "descending",
  });

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInvoices();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load invoices", err);
        setInvoices([]);
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

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const aVal = a?.[sortConfig.key] ?? "";
      const bVal = b?.[sortConfig.key] ?? "";

      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [invoices, sortConfig]);

  /* ---------------- FILTER ---------------- */
  const filteredInvoices = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return sortedInvoices.filter((invoice) => {
      return (
        (invoice?.invoice_no || "").toLowerCase().includes(query) ||
        (invoice?.tenant_name || "").toLowerCase().includes(query) ||
        (invoice?.type || "").toLowerCase().includes(query)
      );
    });
  }, [sortedInvoices, searchQuery]);

  /* ---------------- HELPERS ---------------- */
  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;

    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      Paid: "bg-green-100 text-green-700",
      "Partially Paid": "bg-yellow-100 text-yellow-700",
      Unpaid: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          styles[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow sticky top-0 z-20">
        <h2 className="text-2xl font-bold">Invoices</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search invoices..."
            className="border px-4 py-2 rounded-lg w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/invoices/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Generate Invoice
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">

          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-100 text-sm font-semibold">
              <tr>
                <th onClick={() => handleSort("invoice_no")} className="p-4 cursor-pointer">
                  Invoice {renderSortArrow("invoice_no")}
                </th>
                <th className="p-4">Tenant</th>
                <th onClick={() => handleSort("issue_date")} className="p-4 cursor-pointer">
                  Issue {renderSortArrow("issue_date")}
                </th>
                <th onClick={() => handleSort("due_date")} className="p-4 cursor-pointer">
                  Due {renderSortArrow("due_date")}
                </th>
                <th className="p-4">Type</th>
                <th className="p-4">Total</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/manager/invoices/${inv.id}`)}>
                  <td
                    className="p-4 font-medium text-blue-600 cursor-pointer"
                    onClick={() => navigate(`/manager/invoices/${inv.id}`)}
                  >
                    {inv.invoice_no}
                  </td>

                  <td className="p-4">
                    {inv.tenant_name}
                  </td>

                  <td className="p-4">
                    {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString("en-GB") : ""}
                  </td>

                  <td className="p-4">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB") : ""}
                  </td>

                  <td className="p-4">{inv.type}</td>

                  <td className="p-4 font-semibold">
                    ${Number(inv.total_amount || 0).toLocaleString()}
                  </td>

                  <td className="p-4 text-red-600 font-semibold">
                    ${Number(inv.balance || 0).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {getStatusBadge(inv.status)}
                  </td>

                  <td className="p-4 text-center relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {menuOpen === inv.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
                        <button
                          onClick={() => navigate(`/manager/invoices/${inv.id}`)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>

                        <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS (RESTORED) ================= */}
        <div className="md:hidden space-y-4">

          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="bg-white shadow rounded-xl p-4 relative">

              <div className="flex justify-between items-start">

                <div>
                  <h3 className="font-semibold">{inv.invoice_no}</h3>
                  <p className="text-sm text-gray-500">{inv.tenant_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(inv.status)}

                  <button
                    onClick={() =>
                      setOpenMobileMenu(openMobileMenu === inv.id ? null : inv.id)
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">

                <p><strong>Issue:</strong> {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString("en-GB") : ""}</p>
                <p><strong>Due:</strong> {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB") : ""}</p>
                <p><strong>Type:</strong> {inv.type}</p>
                <p><strong>Total:</strong> ${Number(inv.total_amount || 0).toLocaleString()}</p>
                <p className="text-red-600 font-semibold">
                  <strong>Balance:</strong> ${Number(inv.balance || 0).toLocaleString()}
                </p>

              </div>

              {openMobileMenu === inv.id && (
                <div className="absolute right-4 top-12 bg-white border rounded-lg shadow w-40 z-10">

                  <button
                    onClick={() => navigate(`/manager/invoices/${inv.id}`)}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm">
                    <Download className="w-4 h-4" />
                    PDF
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default InvoicesList;