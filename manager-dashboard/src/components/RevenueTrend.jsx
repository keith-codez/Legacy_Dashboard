import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import invoices from "../data/invoices.json";

function RevenueTrend() {

  const monthly = {};

  invoices.forEach(inv => {

    const month = inv.issue_date.slice(0,7);

    if(!monthly[month])
      monthly[month] = 0;

    monthly[month] += inv.total_amount;

  });

  const chartData = Object.keys(monthly).map(m => ({
    month:m,
    revenue:monthly[m]
  }));

  return (

    <div className="bg-white shadow rounded-lg p-8 h-72">

      <h3 className="font-semibold mb-4">
        Monthly Revenue Trend
      </h3>

      <ResponsiveContainer width="100%" height="100%">

        <LineChart data={chartData}>

          <XAxis dataKey="month"/>
          <YAxis/>
          <Tooltip/>

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