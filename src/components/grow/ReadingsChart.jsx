import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const metricConfig = {
  temperature: { color: "#f43f5e", label: "Temp (°F)" },
  humidity: { color: "#3b82f6", label: "Humidity (%)" },
  ppfd: { color: "#eab308", label: "PPFD" },
  ec: { color: "#10b981", label: "EC" },
  vpd: { color: "#8b5cf6", label: "VPD" },
  ph: { color: "#ec4899", label: "pH" },
};

export default function ReadingsChart({ readings }) {
  const [activeMetrics, setActiveMetrics] = useState(["temperature", "humidity"]);

  const toggleMetric = (metric) => {
    setActiveMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const chartData = [...readings]
    .sort((a, b) => new Date(a.date || a.created_date) - new Date(b.date || b.created_date))
    .slice(-30)
    .map(r => ({
      date: format(new Date(r.date || r.created_date), "MMM d, h:mm a"),
      temperature: r.temperature,
      humidity: r.humidity,
      ppfd: r.ppfd,
      ec: r.ec,
      vpd: r.vpd,
      ph: r.ph,
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <p className="text-white/30 text-sm">Log some readings to see your trends here</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(metricConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => toggleMetric(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeMetrics.includes(key)
                ? "text-white border"
                : "text-white/30 border border-transparent hover:text-white/50"
            }`}
            style={{
              borderColor: activeMetrics.includes(key) ? cfg.color + "60" : undefined,
              backgroundColor: activeMetrics.includes(key) ? cfg.color + "15" : undefined,
            }}
          >
            {cfg.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: 12,
            }}
          />
          {activeMetrics.map(metric => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={metricConfig[metric].color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}