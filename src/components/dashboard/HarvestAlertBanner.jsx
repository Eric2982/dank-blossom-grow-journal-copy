import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function HarvestAlertBanner() {
  const { data: strains = [] } = useQuery({
    queryKey: ["strains-harvest-check"],
    queryFn: () => base44.entities.Strain.list(),
  });

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcoming = strains.filter((s) => {
    if (!s.harvest_date || s.status === "harvested") return false;
    const d = new Date(s.harvest_date);
    return d >= now && d <= threeDaysFromNow;
  });

  if (upcoming.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-amber-300 text-sm font-medium">
          {upcoming.length} strain{upcoming.length > 1 ? "s" : ""} ready to harvest soon
        </p>
        <p className="text-amber-400/70 text-xs mt-0.5">
          {upcoming.map((s) => {
            const days = Math.ceil((new Date(s.harvest_date) - now) / (1000 * 60 * 60 * 24));
            return `${s.name} (${days}d)`;
          }).join(" · ")}
        </p>
      </div>
    </div>
  );
}