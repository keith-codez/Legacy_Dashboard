import { useEffect, useState } from "react";
import { getReports } from "../../api/api";

export default function OwnerReports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getReports().then(setData);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Reports</h1>

      {data.map((r) => (
        <div key={r.tenant_id} className="border p-3 mb-2 rounded bg-white">
          <div>{r.tenant}</div>
          <div className="text-sm text-gray-600">
            Invoiced: ${r.invoiced} | Paid: ${r.paid} | Balance: ${r.balance}
          </div>
        </div>
      ))}
    </div>
  );
}