import React from "react";
import { Thermometer, Droplets, Sun, Zap, Wind, FlaskConical } from "lucide-react";

const iconMap = {
  temperature: Thermometer,
  humidity: Droplets,
  ppfd: Sun,
  ec: Zap,
  vpd: Wind,
  ph: FlaskConical,
};

const unitMap = {
  temperature: "°F",
  humidity: "%",
  ppfd: "µmol/m²/s",
  ec: "mS/cm",
  vpd: "kPa",
  ph: "",
};

const colorMap = {
  temperature: "from-rose-500/20 to-orange-500/20 text-rose-400",
  humidity: "from-blue-500/20 to-cyan-500/20 text-blue-400",
  ppfd: "from-yellow-500/20 to-amber-500/20 text-yellow-400",
  ec: "from-emerald-500/20 to-green-500/20 text-emerald-400",
  vpd: "from-violet-500/20 to-purple-500/20 text-violet-400",
  ph: "from-pink-500/20 to-fuchsia-500/20 text-pink-400",
};

const labelMap = {
  temperature: "Temperature",
  humidity: "Humidity",
  ppfd: "PPFD",
  ec: "EC",
  vpd: "VPD",
  ph: "pH",
};

export default function ReadingCard({ type, value }) {
  const Icon = iconMap[type];
  const unit = unitMap[type];
  const color = colorMap[type];
  const label = labelMap[type];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color.split(" text-")[0]} border border-white/5 p-5 backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-1">{label}</p>
          <p className="text-3xl font-light text-white tabular-nums">
            {value !== null && value !== undefined ? value : "—"}
            <span className="text-sm font-normal text-white/40 ml-1">{unit}</span>
          </p>
        </div>
        <div className={`p-2.5 rounded-xl bg-white/5 ${color.split(" ")[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}