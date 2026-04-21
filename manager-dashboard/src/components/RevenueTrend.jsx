import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getRevenueTrend } from "../api/api";

function RevenueTrend() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRevenueTrend();
        setData(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Revenue trend failed", err);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-8 h-72">
      <h3 className="font-semibold mb-4">Monthly Revenue Trend</h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueTrend;