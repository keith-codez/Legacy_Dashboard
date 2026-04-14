import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";

import { getLeases } from "../../api/api";

function LeaseList() {
  const navigate = useNavigate();

  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "start_date",
    direction: "desc",
  });

  /* ---------------- DATA FETCH ---------------- */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getLeases();
        if (isMounted) setLeases(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load leases");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------- SORT LOGIC ---------------- */
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const compareValues = (a, b, key) => {
    const valA = a?.[key];
    const valB = b?.[key];

    // date handling
    if (key.includes("date")) {
      return new Date(valA) - new Date(valB);
    }

    // numeric handling
    if (!isNaN(valA) && !isNaN(valB)) {
      return Number(valA) - Number(valB);
    }

    // string fallback
    return String(valA || "").localeCompare(String(valB || ""));
  };

  const sortedLeases = useMemo(() => {
    const sorted = [...leases];

    sorted.sort((a, b) => {
      const result = compareValues(a, b, sortConfig.key);
      return sortConfig.direction === "asc" ? result : -result;
    });

    return sorted;
  }, [leases, sortConfig]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredLeases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) return sortedLeases;

    return sortedLeases.filter((l) => {
      return (
        l?.lease_number?.toLowerCase().includes(q) ||
        l?.tenant_name?.toLowerCase().includes(q) ||
        l?.unit_no?.toLowerCase().includes(q)
      );
    });
  }, [sortedLeases, searchQuery]);

  /* ---------------- UI HELPERS ---------------- */
  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;

    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1" />
    );
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Expired":
        return "bg-gray-200 text-gray-600";
      case "Terminated":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  /* ---------------- STATES ---------------- */
  if (loading) return <div className="p-6">Loading leases...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full h-full flex flex-col">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 bg-white shadow sticky top-0 z-20">
        <h2 className="text-2xl font-bold">Leases</h2>

        <input
          type="text"
          placeholder="Search leases..."
          className="border px-4 py-2 rounded-lg w-full md:w-72"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          onClick={() => navigate("/manager/leases/create")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Create Lease
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100 text-sm font-semibold">
              <tr>
                <th onClick={() => handleSort("lease_number")} className="p-4 cursor-pointer">
                  Lease {renderSortArrow("lease_number")}
                </th>
                <th className="p-4">Tenant</th>
                <th className="p-4">Unit</th>
                <th onClick={() => handleSort("rent_amount")} className="p-4 cursor-pointer">
                  Rent {renderSortArrow("rent_amount")}
                </th>
                <th onClick={() => handleSort("start_date")} className="p-4 cursor-pointer">
                  Period {renderSortArrow("start_date")}
                </th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeases.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => navigate(`/manager/leases/${l.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-4 font-medium">{l.lease_number}</td>
                  <td className="p-4">{l.tenant_name}</td>
                  <td className="p-4">{l.unit_no}</td>
                  <td className="p-4 font-semibold text-green-600">
                    ${Number(l.rent_amount || 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {l.start_date && new Date(l.start_date).toLocaleDateString("en-GB")} →{" "}
                    {l.end_date && new Date(l.end_date).toLocaleDateString("en-GB")}
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

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {filteredLeases.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/manager/leases/${l.id}`)}
              className="bg-white shadow rounded-xl p-4 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{l.lease_number}</h3>

                <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(l.status)}`}>
                  {l.status}
                </span>
              </div>

              <p className="mt-2 text-green-600 font-bold">
                ${Number(l.rent_amount || 0).toLocaleString()}
              </p>

              <div className="mt-2 text-sm space-y-1">
                <p><strong>Tenant:</strong> {l.tenant_name}</p>
                <p><strong>Unit:</strong> {l.unit_no}</p>
                <p>
                  <strong>Period:</strong>{" "}
                  {l.start_date && new Date(l.start_date).toLocaleDateString("en-GB")} →{" "}
                  {l.end_date && new Date(l.end_date).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default LeaseList;