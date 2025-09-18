// components/DieselChart.jsx (modern gradient bar chart)
import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Legend } from "recharts";

export default function DieselChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className=" font-semibold text-[#236a80] mb-4 text-center mt-3">Daily Diesel Consumption (L)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={40}>
          <defs>
            <linearGradient id="dieselGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#236a80" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#e6f1f0ff" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fill: "#4b5563", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: "12px" }} cursor={{ fill: "#f0f9ff" }} />
          <Legend />
          <Bar dataKey="diesel" fill="url(#dieselGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}