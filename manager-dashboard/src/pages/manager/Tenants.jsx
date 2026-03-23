import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import tenantsData from "../../data/tenants.json";

import {
  getTenantStatus,
  getTenantBalance
} from "../../utils/tenantSelectors";

function TenantList() {
  const navigate = useNavigate();

  const [tenants] = useState(tenantsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: "company_name",
    direction: "ascending",
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedTenants = useMemo(() => {
    return [...tenants].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [tenants, sortConfig]);

  const filteredTenants = sortedTenants.filter((tenant) => {
    const q = searchQuery.toLowerCase();
    return (
      tenant.company_name.toLowerCase().includes(q) ||
      tenant.primary_contact.toLowerCase().includes(q) ||
      tenant.primary_email.toLowerCase().includes(q) ||
      tenant.phone.toLowerCase().includes(q)
    );
  });

  const toggleMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const closeMenu = () => setMenuOpen(null);

  const getStatusStyles = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-600";
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow sticky top-0 z-20">
        <h2 className="text-2xl font-bold">Tenants</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search tenants..."
            className="border px-4 py-2 rounded-lg w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/tenants/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Tenant
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100 text-sm font-semibold">
              <tr>
                <th onClick={() => handleSort("company_name")} className="p-4 cursor-pointer">
                  Company
                </th>
                <th onClick={() => handleSort("primary_contact")} className="p-4 cursor-pointer">
                  Contact
                </th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Balance</th>
                <th onClick={() => handleSort("created_at")} className="p-4 cursor-pointer">
                  Date Added
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {filteredTenants.map((tenant) => {

                const status = getTenantStatus(tenant.id);
                const balance = getTenantBalance(tenant.id);

                return (
                  <tr
                    key={tenant.id}
                    onClick={() => navigate(`/manager/tenants/${tenant.id}`)}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-4 font-medium">{tenant.company_name}</td>
                    <td className="p-4">{tenant.primary_contact}</td>
                    <td className="p-4">{tenant.primary_email}</td>
                    <td className="p-4">{tenant.phone}</td>

                    <td className="p-4 font-semibold text-red-600">
                      ${balance.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {new Date(tenant.created_at).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(status)}`}>
                        {status}
                      </span>
                    </td>

                    <td
                      className="p-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleMenu(tenant.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {menuOpen === tenant.id && (
                        <div className="absolute right-8 mt-2 w-36 bg-white border rounded shadow">
                          <button
                            onClick={() => {
                              closeMenu();
                              navigate(`/manager/tenants/${tenant.id}`);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              closeMenu();
                              navigate(`/manager/tenants/${tenant.id}/edit`);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Edit
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

        {/* Mobile */}
        <div className="md:hidden space-y-4">
          {filteredTenants.map((tenant) => {

            const status = getTenantStatus(tenant.id);
            const balance = getTenantBalance(tenant.id);

            return (
              <div
                key={tenant.id}
                onClick={() => navigate(`/manager/tenants/${tenant.id}`)}
                className="bg-white shadow rounded-xl p-4 relative"
              >
                <h3 className="font-semibold text-lg">
                  {tenant.company_name}
                </h3>

                <p className="text-sm text-gray-600">
                  {tenant.primary_contact}
                </p>

                <div className="mt-3 text-sm space-y-1">
                  <p><strong>Email:</strong> {tenant.primary_email}</p>
                  <p><strong>Phone:</strong> {tenant.phone}</p>
                  <p className="text-red-600 font-semibold">
                    <strong>Balance:</strong> ${balance.toLocaleString()}
                  </p>
                </div>

                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getStatusStyles(status)}`}>
                  {status}
                </span>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default TenantList;