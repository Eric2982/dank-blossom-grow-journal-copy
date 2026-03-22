import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Thermometer, Droplets, Sun, Zap, Wind, FlaskConical, Activity, ArrowLeft } from "lucide-react";
import StatCard from "../components/grow/StatCard";
import PullToRefresh from "../components/PullToRefresh";
import { useNavigation } from "@/lib/NavigationContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Summary() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const strainId = urlParams.get("strain_id");
  const { goBack, canGoBack } = useNavigation();

  const { data: strain } = useQuery({
    queryKey: ["strain", strainId],
    queryFn: async () => {
      if (!strainId) return null;
      const results = await base44.entities.Strain.filter({ id: strainId });
      return results[0] || null;
    },
    enabled: !!strainId,
  });

  const { data: readings = [] } = useQuery({
    queryKey: ["readings", strainId || "all"],
    queryFn: () => strainId
      ? base44.entities.GrowReading.filter({ strain_id: strainId }, "-created_date", 100)
      : base44.entities.GrowReading.list("-created_date", 100),
  });

  const calculateStats = () => {
    if (readings.length === 0) return {};
    const recent = readings.slice(0, 10);
    const older = readings.slice(10, 20);
    const avg = (arr, key) => {
      const values = arr.filter(r => r[key] != null).map(r => r[key]);
      return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null;
    };
    const trend = (recentAvg, olderAvg) => {
      if (!recentAvg || !olderAvg) return { trend: null, value: null };
      const diff = ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1);
      return { trend: diff > 0 ? "up" : diff < 0 ? "down" : null, value: `${Math.abs(diff)}%` };
    };
    const stats = {};
    ["temperature", "humidity", "ppfd", "ec", "vpd", "ph"].forEach(key => {
      const recentAvg = avg(recent, key);
      const olderAvg = avg(older, key);
      const t = trend(recentAvg, olderAvg);
      stats[key] = { avg: recentAvg, ...t };
    });
    return stats;
  };

  const stats = calculateStats();
  const metrics = [
    { key: "temperature", label: "Avg Temperature", unit: "°F", icon: Thermometer, color: "from-rose-500/10 to-orange-500/10" },
    { key: "humidity", label: "Avg Humidity", unit: "%", icon: Droplets, color: "from-blue-500/10 to-cyan-500/10" },
    { key: "ppfd", label: "Avg PPFD", unit: "µmol/m²/s", icon: Sun, color: "from-yellow-500/10 to-amber-500/10" },
    { key: "ec", label: "Avg EC", unit: "mS/cm", icon: Zap, color: "from-emerald-500/10 to-green-500/10" },
    { key: "vpd", label: "Avg VPD", unit: "kPa", icon: Wind, color: "from-violet-500/10 to-purple-500/10" },
    { key: "ph", label: "Avg pH", unit: "", icon: FlaskConical, color: "from-pink-500/10 to-fuchsia-500/10" },
  ];

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["readings"] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        {strainId && (
          <Link to={createPageUrl(`StrainDetail?id=${strainId}`)}>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-light text-white">Data Summary{strain ? ` — ${strain.name}` : ""}</h1>
          <p className="text-white/30 text-sm mt-1">Overview of your environment trends</p>
        </div>
      </div>

      {readings.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center">
          <Activity className="w-10 h-10 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">Log some readings to see your data trends</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Last 10 vs Previous 10</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map(m => (
                <StatCard key={m.key} title={m.label} value={stats[m.key]?.avg ?? "—"} unit={m.unit}
                  trend={stats[m.key]?.trend} trendValue={stats[m.key]?.value} icon={m.icon} color={m.color} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-2">Total Readings</p>
                <p className="text-3xl font-light text-white">{readings.length}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-2">Most Common Stage</p>
                <p className="text-3xl font-light text-white">
                  {(() => {
                    const stages = readings.map(r => r.grow_stage).filter(Boolean);
                    const counts = {};
                    stages.forEach(s => counts[s] = (counts[s] || 0) + 1);
                    const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                    const emoji = { seedling: "🌱", vegetative: "🌿", flowering: "🌸", harvest: "🌾" };
                    return max ? emoji[max[0]] : "—";
                  })()}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-2">Days Tracked</p>
                <p className="text-3xl font-light text-white">
                  {(() => {
                    if (readings.length < 2) return "—";
                    const oldest = new Date(readings[readings.length - 1].date || readings[readings.length - 1].created_date);
                    const newest = new Date(readings[0].date || readings[0].created_date);
                    return Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24));
                  })()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </PullToRefresh>
  );
}