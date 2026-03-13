import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, MoreVertical, Download, Eye, Pencil } from "lucide-react";

import invoicesData from "../../data/invoices.json";
import tenantsData from "../../data/tenants.json";

import {
  getInvoiceBalance,
  getInvoiceStatus
} from "../../utils/tenantSelectors";

function InvoicesList() {

  const navigate = useNavigate();

  const [openMobileMenu, setOpenMobileMenu] = useState(null);

  const [invoices] = useState(invoicesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  

  const [sortConfig, setSortConfig] = useState({
    key: "issue_date",
    direction: "descending"
  });

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

  const sortedInvoices = useMemo(() => {

    return [...invoices].sort((a, b) => {

      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;

      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;

      return 0;

    });

  }, [invoices, sortConfig]);

  const filteredInvoices = sortedInvoices.filter((invoice) => {

    const query = searchQuery.toLowerCase();

    return (
      invoice.invoice_no.toLowerCase().includes(query) ||
      tenantMap[invoice.tenant_id]?.toLowerCase().includes(query) ||
      invoice.type.toLowerCase().includes(query)
    );

  });

  const renderSortArrow = (key) => {

    if (sortConfig.key !== key) return null;

    return sortConfig.direction === "ascending"
      ? <ArrowUp className="inline w-4 h-4 ml-1"/>
      : <ArrowDown className="inline w-4 h-4 ml-1"/>;

  };

  const getStatusBadge = (status) => {

    const styles = {
      Paid: "bg-green-100 text-green-700",
      "Partially Paid": "bg-yellow-100 text-yellow-700",
      Open: "bg-red-100 text-red-700"
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
        {status}
      </span>
    );

  };

  const downloadInvoicePDF = (invoice) => {

    // prototype placeholder
    console.log("Download PDF for", invoice.invoice_no);

  };
  

  return (

    <div className="w-full h-full flex flex-col">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow sticky top-0 z-20">

        <h2 className="text-2xl font-bold">Invoices</h2>

        <div className="flex gap-4 w-full md:w-auto">

          <input
            type="text"
            placeholder="Search invoices..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/invoices/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Generate Invoice
          </button>

        </div>

      </div>


      {/* Content */}

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">

        {/* Desktop Table */}

        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-gray-100 text-left text-sm font-semibold">

              <tr>

                <th onClick={() => handleSort("invoice_no")} className="p-4 cursor-pointer">
                  Invoice {renderSortArrow("invoice_no")}
                </th>

                <th className="p-4">Tenant</th>

                <th onClick={() => handleSort("issue_date")} className="p-4 cursor-pointer">
                  Issue Date {renderSortArrow("issue_date")}
                </th>

                <th onClick={() => handleSort("due_date")} className="p-4 cursor-pointer">
                  Due Date {renderSortArrow("due_date")}
                </th>

                <th className="p-4">Type</th>

                <th onClick={() => handleSort("total_amount")} className="p-4 cursor-pointer">
                  Amount {renderSortArrow("total_amount")}
                </th>

                <th className="p-4">Balance</th>

                <th className="p-4">Status</th>

                <th className="p-4 text-center">Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredInvoices.map((invoice) => {

                const balance = getInvoiceBalance(invoice.id);
                const status = getInvoiceStatus(invoice.id);

                return (

                  <tr
                    key={invoice.id}
                    className="border-t hover:bg-gray-50 transition"
                  >

                    <td className="p-4 font-medium">
                      {invoice.invoice_no}
                    </td>

                    <td className="p-4">
                      {tenantMap[invoice.tenant_id]}
                    </td>

                    <td className="p-4">
                      {new Date(invoice.issue_date).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-4">
                      {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-4">
                      {invoice.type}
                    </td>

                    <td className="p-4 font-semibold">
                      ${invoice.total_amount.toLocaleString()}
                    </td>

                    <td className="p-4 text-red-600 font-semibold">
                      ${balance.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(status)}
                    </td>

                    <td className="p-4 text-center relative">

                      <button
                        onClick={() => setMenuOpen(menuOpen === invoice.id ? null : invoice.id)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <MoreVertical size={18}/>
                      </button>

                      {menuOpen === invoice.id && (

                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow z-20">

                          <button
                            onClick={() => navigate(`/manager/invoices/${invoice.id}`)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() => downloadInvoicePDF(invoice)}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            <Download size={14}/>
                            Download PDF
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>


        {/* Mobile Cards */}


        <div className="md:hidden space-y-4">

          {filteredInvoices.map((invoice) => {

            const balance = getInvoiceBalance(invoice.id);
            const status = getInvoiceStatus(invoice.id);

            const statusStyles = {
              Paid: "bg-green-100 text-green-700",
              Partial: "bg-yellow-100 text-yellow-700",
              Overdue: "bg-red-100 text-red-700",
              Open: "bg-gray-100 text-gray-700"
            };

            return (
              <div
                key={invoice.id}
                className="bg-white shadow rounded-xl p-4 relative"
              >

                {/* Header */}

                <div className="flex justify-between items-start">

                  <div>
                    <h3 className="font-semibold">
                      {invoice.invoice_no}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {tenantMap[invoice.tenant_id]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusStyles[status]}`}
                    >
                      {status}
                    </span>

                    {/* 3 dot menu */}

                    <button
                      onClick={() =>
                        setOpenMobileMenu(
                          openMobileMenu === invoice.id ? null : invoice.id
                        )
                      }
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                  </div>

                </div>

                {/* Body */}

                <div className="mt-3 text-sm text-gray-600 space-y-1">

                  <p>
                    <strong>Issue:</strong>{" "}
                    {new Date(invoice.issue_date).toLocaleDateString("en-GB")}
                  </p>

                  <p>
                    <strong>Due:</strong>{" "}
                    {new Date(invoice.due_date).toLocaleDateString("en-GB")}
                  </p>

                  <p>
                    <strong>Type:</strong> {invoice.type}
                  </p>

                  <p>
                    <strong>Total:</strong>{" "}
                    ${invoice.total_amount.toLocaleString()}
                  </p>

                  <p className="text-red-600 font-semibold">
                    <strong>Balance:</strong>{" "}
                    ${balance.toLocaleString()}
                  </p>

                </div>

                {/* Dropdown */}

                {openMobileMenu === invoice.id && (
                  <div className="absolute right-4 top-12 bg-white border rounded-lg shadow w-40 z-10">

                    <button
                      onClick={() =>
                        navigate(`/manager/invoices/${invoice.id}`)
                      }
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>

                  </div>
                )}

              </div>
            );

          })}

        </div>

      </div>

    </div>

  );

}

export default InvoicesList;