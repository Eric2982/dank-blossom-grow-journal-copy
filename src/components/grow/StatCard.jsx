import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({ title, value, unit, trend, trendValue, icon: Icon, color }) {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="w-3 h-3" />;
    if (trend === "up") return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "text-white/20";
    if (trend === "up") return "text-emerald-400";
    return "text-rose-400";
  };

  return (
    <div className={`rounded-2xl border border-white/5 bg-gradient-to-br ${color} p-5`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-white/40">{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="w-4 h-4 text-white/60" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-light text-white tabular-nums">
            {value}
            <span className="text-sm font-normal text-white/40 ml-1">{unit}</span>
          </p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}