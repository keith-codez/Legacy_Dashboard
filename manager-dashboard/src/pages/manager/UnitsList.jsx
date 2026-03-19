import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import unitsData from "../../data/units.json";

function UnitsList() {
  const navigate = useNavigate();
  const [units] = useState(unitsData);
  const [menuOpen, setMenuOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => setMenuOpen(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const filteredUnits = units.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.unit_no.toLowerCase().includes(q) ||
      u.unit_type.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q)
    );
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-green-100 text-green-700";
      case "Vacant":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white border-b sticky top-0 z-20">
        <h2 className="text-2xl font-bold tracking-tight">Units</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search units..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-72 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => navigate("/manager/units/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Unit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border">
          <table className="w-full">
            <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="p-4">Unit No</th>
                <th className="p-4">Floor</th>
                <th className="p-4">Size (sqm)</th>
                <th className="p-4">Base Rent ($)</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {filteredUnits.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{u.unit_no}</td>
                  <td className="p-4">{u.floor}</td>
                  <td className="p-4">{u.size_sqm}</td>
                  <td className="p-4">${u.base_rent.toLocaleString()}</td>
                  <td className="p-4">{u.unit_type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === u.id ? null : u.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuOpen === u.id && (
                      <div className="absolute right-4 mt-2 w-36 bg-white shadow-lg rounded-lg z-10 border">
                        <button
                          onClick={() => navigate(`/manager/units/${u.id}`)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/manager/units/${u.id}/edit`)}
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
        <div className="lg:hidden space-y-4">
          {filteredUnits.map((u) => (
            <div key={u.id} className="bg-white shadow-sm border rounded-xl p-4 relative">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base">{u.unit_no}</h3>
                  <p className="text-sm text-gray-500">{u.unit_type} | Floor {u.floor}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === u.id ? null : u.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {menuOpen === u.id && (
                  <div className="absolute right-4 top-10 w-36 bg-white shadow-lg rounded-lg z-10 border">
                    <button
                      onClick={() => navigate(`/manager/units/${u.id}`)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/manager/units/${u.id}/edit`)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p><strong>Size:</strong> {u.size_sqm} sqm</p>
                <p><strong>Base Rent:</strong> ${u.base_rent.toLocaleString()}</p>
                <p><strong>Status:</strong>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(u.status)}`}>
                    {u.status}
                  </span>
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default UnitsList;