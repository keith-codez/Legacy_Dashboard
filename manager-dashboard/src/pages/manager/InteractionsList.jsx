import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import { getInteractions, getTenants } from "../../api/api";

function InteractionsList() {
  const navigate = useNavigate();

  const [interactions, setInteractions] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [iRes, tRes] = await Promise.all([
          getInteractions(),
          getTenants(),
        ]);

        setInteractions(iRes);
        setTenants(tRes);
      } catch (err) {
        console.error("Failed to load interactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ---------------- CLOSE MENU ---------------- */
  useEffect(() => {
    const handleClick = () => setMenuOpen(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  /* ---------------- TENANT MAP ---------------- */
  const tenantMap = useMemo(() => {
    const map = {};
    tenants.forEach((t) => (map[t.id] = t.company_name));
    return map;
  }, [tenants]);

  /* ---------------- FILTER ---------------- */
  const filteredInteractions = interactions.filter((i) => {
    const q = searchQuery.toLowerCase();

    return (
      i.subject?.toLowerCase().includes(q) ||
      i.type?.toLowerCase().includes(q) ||
      tenantMap[i.tenant]?.toLowerCase().includes(q)
    );
  });

  /* ---------------- PRIORITY STYLES ---------------- */
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <div className="p-6">Loading interactions...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white border-b sticky top-0 z-20">
        <h2 className="text-2xl font-bold tracking-tight">Interactions</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search interactions..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full md:w-72 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            onClick={() => navigate("/manager/interactions/new")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Record Interaction
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
                <th className="p-4">Tenant</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Date</th>
                <th className="p-4">Priority</th>
                <th className="p-4 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {filteredInteractions.map((i) => (
                <tr key={i.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">{tenantMap[i.tenant] || "—"}</td>
                  <td className="p-4">{i.type}</td>
                  <td className="p-4 font-medium">{i.subject}</td>
                  <td className="p-4">
                    {i.date
                      ? new Date(i.date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityStyles(i.priority)}`}>
                      {i.priority}
                    </span>
                  </td>
                  <td className="p-4 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === i.id ? null : i.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuOpen === i.id && (
                      <div className="absolute right-4 mt-2 w-32 bg-white shadow-lg rounded-lg z-10 border">
                        <button
                          onClick={() => navigate(`/manager/interactions/${i.id}`)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
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
          {filteredInteractions.map((i) => (
            <div key={i.id} className="bg-white shadow-sm border rounded-xl p-4 relative">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base">{i.subject}</h3>
                  <p className="text-sm text-gray-500">{tenantMap[i.tenant] || "—"}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === i.id ? null : i.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {menuOpen === i.id && (
                  <div className="absolute right-4 top-10 w-32 bg-white shadow-lg rounded-lg z-10 border">
                    <button
                      onClick={() => navigate(`/manager/interactions/${i.id}`)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      View
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p><strong>Type:</strong> {i.type}</p>
                <p>
                  <strong>Date:</strong>{" "}
                  {i.date
                    ? new Date(i.date).toLocaleDateString("en-GB")
                    : "—"}
                </p>
                <p>
                  <strong>Priority:</strong>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityStyles(i.priority)}`}>
                    {i.priority}
                  </span>
                </p>
                <p><strong>Recorded By:</strong> {i.recorded_by}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default InteractionsList;