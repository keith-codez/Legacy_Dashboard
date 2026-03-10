// src/components/OccupancyTrend.jsx
import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import units from "../data/units.json";
import leases from "../data/leases.json";

/**
 * Calculates occupancy percentage per month over the past year.
 */
function calculateOccupancyTrend() {
  const trend = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthDate.toLocaleString("default", { month: "short", year: "numeric" });

    // Count units that were occupied during that month
    let occupied = 0;
    units.forEach((unit) => {
      const lease = leases.find(l => l.unit_id === unit.id && l.status === "Active");
      if (!lease) return;
      const start = new Date(lease.start_date);
      const end = new Date(lease.end_date);
      if (monthDate >= start && monthDate <= end) {
        occupied++;
      }
    });

    const occupancyRate = Math.round((occupied / units.length) * 100);
    trend.push({ month, occupancyRate });
  }
  return trend;
}

export default function OccupancyTrend() {
  const data = useMemo(() => calculateOccupancyTrend(), []);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Occupancy Trend (Past 12 Months)</h3>
      <div className="flex-1 w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Line type="monotone" dataKey="occupancyRate" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}