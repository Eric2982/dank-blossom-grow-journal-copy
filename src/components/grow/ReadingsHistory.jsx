import React from "react";
import { format } from "date-fns";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const stageEmoji = {
  seedling: "🌱",
  vegetative: "🌿",
  flowering: "🌸",
  harvest: "🌾",
};

export default function ReadingsHistory({ readings, onDelete, onEdit }) {
  if (readings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <p className="text-white/30 text-sm">No readings logged yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="overflow-x-auto touch-pan-x">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-white/30 font-medium text-xs">Date</th>
              <th className="text-center px-3 py-3 text-white/30 font-medium text-xs">Stage</th>
              <th className="text-right px-3 py-3 text-rose-400/60 font-medium text-xs">Temp</th>
              <th className="text-right px-3 py-3 text-blue-400/60 font-medium text-xs">RH%</th>
              <th className="text-right px-3 py-3 text-yellow-400/60 font-medium text-xs">PPFD</th>
              <th className="text-right px-3 py-3 text-emerald-400/60 font-medium text-xs">EC</th>
              <th className="text-right px-3 py-3 text-violet-400/60 font-medium text-xs">VPD</th>
              <th className="text-right px-3 py-3 text-pink-400/60 font-medium text-xs">pH</th>
              <th className="px-3 py-3 text-white/30 font-medium text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => (
              <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white/50 text-xs">{format(new Date(r.date || r.created_date), "MMM d, h:mm a")}</td>
                <td className="text-center px-3 py-3">{stageEmoji[r.grow_stage] || "—"}</td>
                <td className="text-right px-3 py-3 text-white/70 tabular-nums">{r.temperature ?? "—"}</td>
                <td className="text-right px-3 py-3 text-white/70 tabular-nums">{r.humidity ?? "—"}</td>
                <td className="text-right px-3 py-3 text-white/70 tabular-nums">{r.ppfd ?? "—"}</td>
                <td className="text-right px-3 py-3 text-white/70 tabular-nums">{r.ec ?? "—"}</td>
                <td className="text-right px-3 py-3 text-white/70 tabular-nums">{r.vpd ?? "—"}</td>
                <td className="text-right px-3 py-3 text-white/70 tabular-nums">{r.ph ?? "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px] w-11 h-11 text-white/40 hover:text-white" onClick={() => onEdit(r)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px] w-11 h-11 text-white/20 hover:text-red-400" onClick={() => onDelete(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}