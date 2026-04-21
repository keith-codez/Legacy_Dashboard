import { useEffect, useState } from "react";
import { getTenantOutstandingBalances } from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


export default function TenantOutstandingChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTenantOutstandingBalances();
        setData(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Outstanding balances failed", err);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">
        Tenant Outstanding Balances
      </h3>

      <div className="flex-1 w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tenant" />
            <YAxis />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Bar dataKey="outstanding" className="fill-orange-500" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}