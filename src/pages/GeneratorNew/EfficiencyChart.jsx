import React from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

export default function EfficiencyChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
      <h3 className="text-lg font-semibold text-[#236a80] mb-4">Efficiency Trend (kWh/L)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fill: "#4b5563" }} />
          <YAxis tick={{ fill: "#4b5563" }} />
          <Tooltip contentStyle={{ borderRadius: "12px" }} />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="#236a80"
            strokeWidth={3}
            dot={{ r: 5, stroke: "#236a80", strokeWidth: 2, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}