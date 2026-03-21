import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import NutrientForm from "../components/grow/NutrientForm";
import PullToRefresh from "../components/PullToRefresh";

const typeColors = {
  base: "bg-blue-500/15 text-blue-400", bloom: "bg-pink-500/15 text-pink-400",
  grow: "bg-emerald-500/15 text-emerald-400", "cal-mag": "bg-orange-500/15 text-orange-400",
  silica: "bg-cyan-500/15 text-cyan-400", enzyme: "bg-yellow-500/15 text-yellow-400",
  beneficial: "bg-green-500/15 text-green-400", pH_up: "bg-violet-500/15 text-violet-400",
  pH_down: "bg-rose-500/15 text-rose-400", other: "bg-zinc-500/15 text-zinc-400",
};
const stageEmoji = { seedling: "🌱", vegetative: "🌿", flowering: "🌸", harvest: "🌾" };

export default function Nutrients() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({ queryKey: ["nutrients"], queryFn: () => base44.entities.NutrientLog.list("-created_date", 100) });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NutrientLog.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nutrients"] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutrientLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutrients"] }),
  });

  return (
    <PullToRefresh onRefresh={() => queryClient.invalidateQueries({ queryKey: ["nutrients"] })}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white">Nutrient Log</h1>
            <p className="text-white/30 text-sm mt-1">Track your feedings and amendments</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"><Plus className="w-4 h-4" /> Log Nutrient</Button>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center">
            <Droplets className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No nutrient logs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0"><Droplets className="w-5 h-5 text-emerald-400" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div><h3 className="text-white font-medium text-sm">{log.nutrient_name}</h3>{log.brand && <p className="text-white/30 text-xs mt-0.5">{log.brand}</p>}</div>
                    <p className="text-white/30 text-xs shrink-0">{format(new Date(log.created_date), "MMM d, h:mm a")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={`${typeColors[log.nutrient_type]} border-0 text-[10px]`}>{log.nutrient_type?.replace("_", " ")}</Badge>
                    <span className="text-white/50 text-xs">{log.volume_ml} mL</span>
                    {log.water_volume_liters && <span className="text-white/30 text-xs">in {log.water_volume_liters}L water</span>}
                    {log.grow_stage && <span className="text-white/30 text-xs">{stageEmoji[log.grow_stage]}</span>}
                  </div>
                  {log.notes && <p className="text-white/30 text-xs mt-2">{log.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px] w-11 h-11 text-white/15 hover:text-red-400 shrink-0" onClick={() => deleteMutation.mutate(log.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <NutrientForm open={showForm} onOpenChange={setShowForm} onSubmit={(data) => createMutation.mutate(data)} />
      </div>
    </PullToRefresh>
  );
}