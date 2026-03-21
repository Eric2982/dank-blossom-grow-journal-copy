import React, { useMemo, useState } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { Wind, ThermometerSun, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

// ── VPD calculation ──────────────────────────────────────────────────────────
function calcVPD(tempF, rh) {
  if (tempF == null || rh == null) return null;
  const tempC = (tempF - 32) * 5 / 9;
  const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  return parseFloat(((1 - rh / 100) * svp).toFixed(2));
}

// ── Stage VPD targets ────────────────────────────────────────────────────────
const STAGE_VPD = {
  germination: { min: 0.4, max: 0.8, label: "Germination", color: "#34d399" },
  seedling:    { min: 0.4, max: 0.8, label: "Seedling",    color: "#34d399" },
  vegetative:  { min: 0.8, max: 1.2, label: "Vegetative",  color: "#60a5fa" },
  flowering:   { min: 1.0, max: 1.5, label: "Flowering",   color: "#c084fc" },
  harvest:     { min: 1.5, max: 2.0, label: "Late Flower",  color: "#f97316" },
};

const DEFAULT_TARGET = { min: 0.8, max: 1.5, label: "General", color: "#a78bfa" };

// ── VPD zone color ───────────────────────────────────────────────────────────
function vpdZoneColor(vpd) {
  if (vpd < 0.4)  return { bg: "#1e3a5f", label: "Too Low",      text: "#60a5fa" };
  if (vpd < 0.8)  return { bg: "#14532d", label: "Seedling Zone", text: "#34d399" };
  if (vpd < 1.2)  return { bg: "#166534", label: "Veg Zone",      text: "#4ade80" };
  if (vpd < 1.6)  return { bg: "#4c1d95", label: "Flower Zone",   text: "#c084fc" };
  if (vpd < 2.0)  return { bg: "#7c2d12", label: "Late Flower",   text: "#f97316" };
  return           { bg: "#450a0a", label: "Danger",             text: "#f87171" };
}

// ── Heatmap Grid ─────────────────────────────────────────────────────────────
const TEMPS = [65, 68, 71, 74, 77, 80, 83, 86, 89, 92, 95];
const HUMIDS = [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20];

function VPDHeatmap({ currentTemp, currentRh }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="w-4 h-4 text-purple-400" />
        <h4 className="text-white text-sm font-medium">VPD Zone Map</h4>
        <span className="text-white/30 text-xs ml-auto">Temp (°F) × Humidity (%) → VPD (kPa)</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {[
          { label: "< 0.4 Too Low",      bg: "#1e3a5f", text: "#60a5fa" },
          { label: "0.4–0.8 Seedling",   bg: "#14532d", text: "#34d399" },
          { label: "0.8–1.2 Veg",        bg: "#166534", text: "#4ade80" },
          { label: "1.2–1.6 Flower",     bg: "#4c1d95", text: "#c084fc" },
          { label: "1.6–2.0 Late",       bg: "#7c2d12", text: "#f97316" },
          { label: "> 2.0 Danger",       bg: "#450a0a", text: "#f87171" },
        ].map(z => (
          <div key={z.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: z.bg, border: `1px solid ${z.text}40` }} />
            <span style={{ color: z.text }}>{z.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 480 }}>
          {/* Temp header */}
          <div className="flex ml-9 mb-0.5">
            {TEMPS.map(t => (
              <div key={t} className="flex-1 text-center text-[9px] text-white/30">{t}</div>
            ))}
          </div>

          {HUMIDS.map(rh => (
            <div key={rh} className="flex items-center mb-0.5 gap-0.5">
              <div className="w-8 text-right text-[9px] text-white/30 pr-1 shrink-0">{rh}%</div>
              {TEMPS.map(t => {
                const vpd = calcVPD(t, rh);
                const zone = vpdZoneColor(vpd);
                const isCurrent = currentTemp != null && currentRh != null
                  && Math.abs(t - currentTemp) <= 1.5
                  && Math.abs(rh - currentRh) <= 2.5;
                return (
                  <div
                    key={t}
                    className="flex-1 aspect-square rounded-sm flex items-center justify-center text-[8px] font-medium cursor-default transition-all relative"
                    style={{
                      backgroundColor: zone.bg,
                      color: zone.text,
                      border: isCurrent ? `2px solid white` : `1px solid transparent`,
                      outline: hovered === `${t}-${rh}` ? `1px solid rgba(255,255,255,0.5)` : undefined,
                    }}
                    onMouseEnter={() => setHovered(`${t}-${rh}`)}
                    onMouseLeave={() => setHovered(null)}
                    title={`${t}°F, ${rh}% RH → ${vpd} kPa — ${zone.label}`}
                  >
                    {isCurrent ? "●" : vpd}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="text-center text-[9px] text-white/30 mt-1 ml-9">Temperature (°F)</div>
        </div>
      </div>

      {hovered && (
        <div className="mt-3 text-xs text-white/40 text-center">
          Hover cells to see VPD — white dot = current reading
        </div>
      )}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <div className="text-white/50 mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="text-white font-medium">{p.value?.toFixed?.(2) ?? p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function VPDAnalytics({ readings, strain }) {
  const [activeView, setActiveView] = useState("vpd"); // vpd | climate

  const stageTarget = STAGE_VPD[strain?.grow_stage] || DEFAULT_TARGET;

  const chartData = useMemo(() => {
    return [...readings]
      .sort((a, b) => new Date(a.date || a.created_date) - new Date(b.date || b.created_date))
      .slice(-60)
      .map(r => {
        const computedVpd = r.vpd ?? calcVPD(r.temperature, r.humidity);
        return {
          date: format(new Date(r.date || r.created_date), "MMM d"),
          temp: r.temperature,
          humidity: r.humidity,
          vpd: computedVpd,
          ppfd: r.ppfd,
          stage: r.grow_stage,
        };
      });
  }, [readings]);

  const latestReading = chartData[chartData.length - 1];
  const currentVPD = latestReading?.vpd;
  const vpdZone = currentVPD != null ? vpdZoneColor(currentVPD) : null;

  // Stats
  const validVPDs = chartData.filter(d => d.vpd != null).map(d => d.vpd);
  const avgVPD = validVPDs.length ? (validVPDs.reduce((a, b) => a + b, 0) / validVPDs.length).toFixed(2) : null;
  const optimalCount = validVPDs.filter(v => v >= stageTarget.min && v <= stageTarget.max).length;
  const optimalPct = validVPDs.length ? Math.round((optimalCount / validVPDs.length) * 100) : 0;

  // Recommendation
  const getRecommendation = () => {
    if (!currentVPD) return null;
    if (currentVPD < stageTarget.min) return { type: "low", msg: "VPD is too low — lower humidity or raise temperature to increase transpiration." };
    if (currentVPD > stageTarget.max) return { type: "high", msg: "VPD is too high — raise humidity or lower temperature to prevent heat stress." };
    return { type: "ok", msg: `VPD is in the optimal range for ${stageTarget.label} stage. Keep it up!` };
  };

  const rec = getRecommendation();

  if (!readings || readings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <Wind className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/30 text-sm">Log some readings to unlock VPD analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-white/40 text-xs mb-1">Current VPD</div>
          <div className="text-2xl font-light" style={{ color: vpdZone?.text ?? "#fff" }}>
            {currentVPD?.toFixed(2) ?? "—"} <span className="text-sm text-white/40">kPa</span>
          </div>
          {vpdZone && <div className="text-xs mt-1" style={{ color: vpdZone.text }}>{vpdZone.label}</div>}
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-white/40 text-xs mb-1">Average VPD</div>
          <div className="text-2xl font-light text-purple-400">
            {avgVPD ?? "—"} <span className="text-sm text-white/40">kPa</span>
          </div>
          <div className="text-xs mt-1 text-white/30">Last {validVPDs.length} readings</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-white/40 text-xs mb-1">In Optimal Zone</div>
          <div className="text-2xl font-light text-emerald-400">
            {optimalPct}<span className="text-sm text-white/40">%</span>
          </div>
          <div className="text-xs mt-1 text-white/30">Target: {stageTarget.min}–{stageTarget.max} kPa</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-white/40 text-xs mb-1">Stage Target</div>
          <div className="text-sm font-medium mt-1" style={{ color: stageTarget.color }}>{stageTarget.label}</div>
          <div className="text-xs text-white/30 mt-1">{stageTarget.min}–{stageTarget.max} kPa optimal</div>
        </div>
      </div>

      {/* Recommendation */}
      {rec && (
        <div className={`rounded-xl border p-3 flex items-start gap-3 text-sm ${
          rec.type === "ok"
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
            : "border-amber-500/20 bg-amber-500/5 text-amber-300"
        }`}>
          {rec.type === "ok" ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
          {rec.msg}
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-2">
        {[
          { id: "vpd", label: "VPD Over Time" },
          { id: "climate", label: "Temp & Humidity" },
          { id: "map", label: "Zone Map" },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === v.id
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-white/30 hover:text-white/60 border border-transparent"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* VPD Chart */}
      {activeView === "vpd" && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-4 h-4 text-purple-400" />
            <h4 className="text-white text-sm font-medium">VPD History</h4>
            <span className="ml-auto text-white/30 text-xs">Shaded = optimal for {stageTarget.label}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 2.5]} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} unit=" kPa" width={55} />
              <Tooltip content={<CustomTooltip />} />

              {/* Danger zone top */}
              <ReferenceArea y1={2.0} y2={2.5} fill="#f97316" fillOpacity={0.07} />
              {/* Optimal zone */}
              <ReferenceArea y1={stageTarget.min} y2={stageTarget.max} fill={stageTarget.color} fillOpacity={0.12} />
              {/* Too low zone */}
              <ReferenceArea y1={0} y2={0.4} fill="#60a5fa" fillOpacity={0.06} />

              <ReferenceLine y={stageTarget.max} stroke={stageTarget.color} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "Max", fill: stageTarget.color, fontSize: 9, position: "right" }} />
              <ReferenceLine y={stageTarget.min} stroke={stageTarget.color} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "Min", fill: stageTarget.color, fontSize: 9, position: "right" }} />

              <Line
                type="monotone"
                dataKey="vpd"
                stroke="#c084fc"
                strokeWidth={2.5}
                dot={{ r: 2, fill: "#c084fc" }}
                name="VPD (kPa)"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Climate Chart */}
      {activeView === "climate" && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <ThermometerSun className="w-4 h-4 text-orange-400" />
            <h4 className="text-white text-sm font-medium">Temperature & Humidity History</h4>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis yAxisId="temp" domain={[50, 105]} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} unit="°F" width={45} />
              <YAxis yAxisId="rh" orientation="right" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} unit="%" width={40} />
              <Tooltip content={<CustomTooltip />} />

              {/* Optimal temp band */}
              <ReferenceArea yAxisId="temp" y1={70} y2={85} fill="#f97316" fillOpacity={0.06} />
              {/* Optimal humidity band */}
              <ReferenceArea yAxisId="rh" y1={40} y2={70} fill="#3b82f6" fillOpacity={0.06} />

              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={2} dot={false} name="Temp (°F)" connectNulls />
              <Line yAxisId="rh" type="monotone" dataKey="humidity" stroke="#60a5fa" strokeWidth={2} dot={false} name="Humidity (%)" connectNulls />

              {/* VPD as secondary line on temp axis scaled for visibility */}
              <Line yAxisId="temp" type="monotone" dataKey="vpd" stroke="#c084fc" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="VPD (kPa)" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/30">
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-orange-400 rounded" /> Temp</div>
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-blue-400 rounded" /> Humidity</div>
            <div className="flex items-center gap-1.5"><div className="w-6 border-t border-dashed border-purple-400" style={{width:24}} /> VPD (overlay)</div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      {activeView === "map" && (
        <VPDHeatmap
          currentTemp={latestReading?.temp}
          currentRh={latestReading?.humidity}
        />
      )}

      {/* Stage guide */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h4 className="text-white text-sm font-medium">VPD Targets by Stage</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(STAGE_VPD).map(([key, s]) => (
            <div
              key={key}
              className={`rounded-lg p-3 border text-center transition-all ${
                strain?.grow_stage === key
                  ? "border-opacity-60 bg-opacity-15"
                  : "border-white/5 bg-white/[0.02]"
              }`}
              style={strain?.grow_stage === key ? { borderColor: s.color + "60", backgroundColor: s.color + "15" } : {}}
            >
              <div className="text-xs font-medium" style={{ color: s.color }}>{s.label}</div>
              <div className="text-white text-sm mt-1">{s.min}–{s.max}</div>
              <div className="text-white/30 text-xs">kPa</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}