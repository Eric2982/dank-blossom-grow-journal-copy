import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Wind } from "lucide-react";
import VPDAnalytics from "./VPDAnalytics";

const ranges = {
  temp:     { low: 65, optimal: [70, 85], high: 90,  unit: "°F"  },
  humidity: { low: 30, optimal: [40, 60], high: 70,  unit: "%"   },
  vpd:      { low: 0.4, optimal: [0.8, 1.5], high: 2.0, unit: "kPa" },
};

const getRange = (value, metric) => {
  const range = ranges[metric];
  if (!value || !range) return null;
  if (value < range.low) return "low";
  if (value > range.high) return "high";
  if (value >= range.optimal[0] && value <= range.optimal[1]) return "optimal";
  return "suboptimal";
};

const getRangeColor = (status) => {
  switch (status) {
    case "optimal":    return "text-green-400";
    case "low":        return "text-blue-400";
    case "high":       return "text-orange-400";
    case "suboptimal": return "text-yellow-400";
    default:           return "text-white/40";
  }
};

const getRangeIcon = (status) => {
  switch (status) {
    case "optimal": return CheckCircle;
    default:        return AlertTriangle;
  }
};

export default function StrainAnalytics({ readings, strain }) {
  const [tab, setTab] = useState("trends"); // trends | vpd

  if (!readings || readings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <Activity className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/30 text-sm">Not enough data for analytics yet</p>
      </div>
    );
  }

  const chartData = readings
    .slice()
    .sort((a, b) => new Date(a.date || a.created_date) - new Date(b.date || b.created_date))
    .map(r => ({
      date:     format(new Date(r.date || r.created_date), "MMM d"),
      temp:     r.temperature,
      humidity: r.humidity,
      vpd:      r.vpd,
      ppfd:     r.ppfd,
    }));

  const calculateTrend = (data, field) => {
    if (data.length < 2) return 0;
    const recent   = data.slice(-7);
    const avg      = recent.reduce((sum, r) => sum + (r[field] || 0), 0) / recent.length;
    const previous = data.slice(-14, -7);
    if (previous.length === 0) return 0;
    const prevAvg  = previous.reduce((sum, r) => sum + (r[field] || 0), 0) / previous.length;
    return ((avg - prevAvg) / prevAvg * 100).toFixed(1);
  };

  const trends = {
    temp:     calculateTrend(chartData, "temp"),
    humidity: calculateTrend(chartData, "humidity"),
    vpd:      calculateTrend(chartData, "vpd"),
  };

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: "trends", label: "Overview", icon: Activity },
          { id: "vpd",    label: "VPD & Transpiration", icon: Wind },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "trends" && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Temperature", value: chartData[chartData.length - 1]?.temp,     metric: "temp",     trend: trends.temp,     color: "text-orange-400" },
              { label: "Humidity",    value: chartData[chartData.length - 1]?.humidity, metric: "humidity", trend: trends.humidity, color: "text-blue-400"   },
              { label: "VPD",         value: chartData[chartData.length - 1]?.vpd,      metric: "vpd",      trend: trends.vpd,      color: "text-purple-400" },
            ].map(stat => {
              const rangeStatus = getRange(stat.value, stat.metric);
              const RangeIcon   = getRangeIcon(rangeStatus);
              return (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white/40 text-xs">{stat.label}</div>
                    {rangeStatus && (
                      <div className={`flex items-center gap-1 ${getRangeColor(rangeStatus)}`}>
                        <RangeIcon className="w-3 h-3" />
                        <span className="text-xs capitalize">{rangeStatus}</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-2xl font-light ${stat.color}`}>
                    {stat.value?.toFixed(1) || "—"} <span className="text-sm">{ranges[stat.metric]?.unit}</span>
                  </div>
                  {stat.trend !== 0 && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${parseFloat(stat.trend) > 0 ? "text-green-400" : "text-red-400"}`}>
                      {parseFloat(stat.trend) > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{Math.abs(stat.trend)}% vs last week</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date"  stroke="rgba(255,255,255,0.4)" style={{ fontSize: "12px" }} />
                <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="temp"     stroke="#fb923c" name="Temp (°F)"    strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#60a5fa" name="Humidity (%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vpd"      stroke="#c084fc" name="VPD (kPa)"    strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "vpd" && (
        <VPDAnalytics readings={readings} strain={strain} />
      )}
    </div>
  );
}