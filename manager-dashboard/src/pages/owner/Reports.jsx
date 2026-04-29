import { useEffect, useMemo, useState } from "react";
import { getReports } from "../../api/api";

export default function OwnerReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReports();
        setData(res);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    return data.reduce(
      (acc, r) => {
        acc.invoiced += Number(r.invoiced || 0);
        acc.paid += Number(r.paid || 0);
        acc.balance += Number(r.balance || 0);
        return acc;
      },
      { invoiced: 0, paid: 0, balance: 0 }
    );
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading financial intelligence layer...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-sm text-gray-500">
          Tenant-level revenue visibility and balance tracking
        </p>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-sm text-gray-500">Total Invoiced</p>
          <p className="text-xl font-semibold">
            ${summary.invoiced.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-xl font-semibold text-green-600">
            ${summary.paid.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 border">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-xl font-semibold text-red-600">
            ${summary.balance.toLocaleString()}
          </p>
        </div>

      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white shadow rounded-xl overflow-x-auto border">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="p-4">Tenant</th>
              <th className="p-4">Invoiced</th>
              <th className="p-4">Paid</th>
              <th className="p-4">Balance</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r) => (
              <tr key={r.tenant_id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{r.tenant}</td>

                <td className="p-4">
                  ${Number(r.invoiced || 0).toLocaleString()}
                </td>

                <td className="p-4 text-green-600 font-medium">
                  ${Number(r.paid || 0).toLocaleString()}
                </td>

                <td className="p-4 text-red-600 font-semibold">
                  ${Number(r.balance || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">

        {data.map((r) => (
          <div
            key={r.tenant_id}
            className="bg-white rounded-xl shadow border p-4 space-y-2"
          >

            <div className="font-semibold text-lg">
              {r.tenant}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">

              <div>
                <p className="text-gray-500">Invoiced</p>
                <p>${Number(r.invoiced || 0).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-gray-500">Paid</p>
                <p className="text-green-600 font-medium">
                  ${Number(r.paid || 0).toLocaleString()}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-gray-500">Balance</p>
                <p className="text-red-600 font-semibold">
                  ${Number(r.balance || 0).toLocaleString()}
                </p>
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}