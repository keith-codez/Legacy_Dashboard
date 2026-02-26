import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import tenantsData from "../../data/tenants.json";

function TenantList() {
  const navigate = useNavigate();
  const [tenants] = useState(tenantsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "company_name",
    direction: "ascending",
  });
  const [menuOpen, setMenuOpen] = useState(null);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedTenants = useMemo(() => {
    const sorted = [...tenants].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [tenants, sortConfig]);

  const filteredTenants = sortedTenants.filter((tenant) => {
    const query = searchQuery.toLowerCase();
    return (
      tenant.company_name.toLowerCase().includes(query) ||
      tenant.primary_contact.toLowerCase().includes(query) ||
      tenant.primary_email.toLowerCase().includes(query) ||
      tenant.phone.toLowerCase().includes(query)
    );
  });

  const toggleMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow z-20 sticky top-0">
        <h2 className="text-2xl font-bold">Tenants</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search tenants..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/add-tenant")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Tenant
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100 text-left text-sm font-semibold sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort("company_name")}
                  className="p-4 cursor-pointer"
                >
                  Company
                </th>
                <th
                  onClick={() => handleSort("primary_contact")}
                  className="p-4 cursor-pointer"
                >
                  Contact
                </th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="p-4 cursor-pointer"
                >
                  Date Added
                </th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  onClick={() => navigate(`/manager/tenants/${tenant.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >

                  <td className="p-4 font-medium">{tenant.company_name}</td>
                  <td className="p-4">{tenant.primary_contact}</td>
                  <td className="p-4">{tenant.primary_email}</td>
                  <td className="p-4">{tenant.phone}</td>
                  <td className="p-4">
                    {new Date(tenant.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(tenant.id);
                      }}
                      className="menu-btn"
                    >

                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                    {menuOpen === tenant.id && (
                      <div className="absolute right-4 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10 dropdown">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manager/tenants/${tenant.id}`);
                            }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { 
                            e.stopPropagation();
                            navigate(`/manager/edit-tenant/${tenant.id}`)
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => navigate(`/manager/tenants/${tenant.id}`)}
              className="bg-white shadow rounded-xl p-4 hover:cursor-pointer transition hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {tenant.company_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tenant.primary_contact}
                  </p>
                </div>

                <button onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(tenant.id)}}
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Email:</strong> {tenant.primary_email}</p>
                <p><strong>Phone:</strong> {tenant.phone}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(tenant.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TenantList;
