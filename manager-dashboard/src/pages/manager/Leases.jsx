import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import leasesData from "../../data/leases.json";
import tenantsData from "../../data/tenants.json";
import unitsData from "../../data/units.json";

function LeaseList() {
  const navigate = useNavigate();

  const [leases] = useState(leasesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  const tenantMap = useMemo(() => {
    const map = {};
    tenantsData.forEach(t => map[t.id] = t.company_name);
    return map;
  }, []);

  const unitMap = useMemo(() => {
    const map = {};
    unitsData.forEach(u => map[u.id] = u.unit_no);
    return map;
  }, []);

  const filteredLeases = leases.filter(l => {
    const q = searchQuery.toLowerCase();

    return (
      l.lease_number.toLowerCase().includes(q) ||
      tenantMap[l.tenant_id]?.toLowerCase().includes(q) ||
      unitMap[l.unit_id]?.toLowerCase().includes(q)
    );
  });

  const getStatusStyles = (status) => {
    if (status === "Active") return "bg-green-100 text-green-700";
    if (status === "Expired") return "bg-gray-200 text-gray-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h2 className="text-2xl font-bold">Leases</h2>

        <input
          type="text"
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-72"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="p-6">
        <table className="w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-4">Lease</th>
              <th className="p-4">Tenant</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Rent</th>
              <th className="p-4">Period</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeases.map(l => (
              <tr
                key={l.id}
                onClick={() => navigate(`/manager/leases/${l.id}`)}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-4">{l.lease_number}</td>
                <td className="p-4">{tenantMap[l.tenant_id]}</td>
                <td className="p-4">{unitMap[l.unit_id]}</td>
                <td className="p-4 font-semibold">${l.rent_amount}</td>
                <td className="p-4">
                  {l.start_date} → {l.end_date}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(l.status)}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaseList;