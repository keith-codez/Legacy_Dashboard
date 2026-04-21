import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { getOccupancyTrend } from "../api/api";

export default function OccupancyTrend() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOccupancyTrend();
        setData(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Occupancy trend failed", err);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">
        Occupancy Trend
      </h3>

      <div className="flex-1 w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />

            <Line
              type="monotone"
              dataKey="occupancyRate"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}