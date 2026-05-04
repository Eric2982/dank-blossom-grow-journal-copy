import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import WateringForm from "../WateringForm";

export default function WateringSection({ strainId, strainName }) {
  const [showForm, setShowForm] = useState(false);
  const [editingWatering, setEditingWatering] = useState(null);
  const queryClient = useQueryClient();

  const { data: watering = [] } = useQuery({
    queryKey: ["watering", strainId],
    queryFn: () => base44.entities.WateringSchedule.filter({ strain_id: strainId, active: true }),
  });

  const { data: wateringActions = [] } = useQuery({
    queryKey: ["wateringActions", strainId],
    queryFn: () => base44.entities.WateringAction.filter({ strain_id: strainId }, "-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WateringSchedule.create({ ...data, strain_id: strainId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["watering", strainId] }); setShowForm(false); setEditingWatering(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WateringSchedule.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["watering", strainId] }); setShowForm(false); setEditingWatering(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WateringSchedule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watering", strainId] }),
  });

  const logWatering = useMutation({
    mutationFn: (data) => base44.entities.WateringAction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wateringActions", strainId] }),
  });

  const getWateringStatus = (schedule) => {
    const diff = differenceInDays(new Date(schedule.next_watering), new Date());
    if (diff < 0) return { label: "Overdue", color: "text-red-400" };
    if (diff === 0) return { label: "Due Today", color: "text-yellow-400" };
    if (diff <= 1) return { label: "Due Soon", color: "text-orange-400" };
    return { label: "Scheduled", color: "text-emerald-400" };
  };

  const handleWatered = (schedule, method, amount) => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + schedule.frequency_days);
    updateMutation.mutate({ id: schedule.id, data: { last_watered: now.toISOString(), next_watering: next.toISOString() } });
    logWatering.mutate({ strain_id: strainId, schedule_id: schedule.id, amount_liters: amount, method });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-white">Watering Schedule</h2>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
          <Plus className="w-3 h-3" /> Add Schedule
        </Button>
      </div>

      {watering.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="text-white/30 text-sm">No watering schedule set</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watering.map(w => {
            const status = getWateringStatus(w);
            return (
              <div key={w.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-white text-sm mb-1">Every {w.frequency_days} days</div>
                    <div className="flex items-center gap-2">
                      <span className={`${status.color} text-xs`}>{status.label}</span>
                      <span className="text-white/40 text-xs">Next: {format(new Date(w.next_watering), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { if (window.confirm(`Water ${strainName}?`)) { const a = parseFloat(prompt("Amount (liters):", "2")); if (a) handleWatered(w, "automated", a); } }} size="sm" variant="outline" className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10">Auto</Button>
                    <Button onClick={() => { const a = parseFloat(prompt("Amount (liters):", "2")); if (a) handleWatered(w, "manual", a); }} size="sm" variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">Manual</Button>
                    <Button onClick={() => { setEditingWatering(w); setShowForm(true); }} size="sm" variant="ghost" className="text-white/40 hover:text-white"><Edit className="w-3 h-3" /></Button>
                    <Button onClick={() => deleteMutation.mutate(w.id)} size="sm" variant="ghost" className="text-white/20 hover:text-red-400"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {wateringActions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-light text-white mb-4">Watering History</h2>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr className="text-white/40 text-xs">
                  <th className="text-left p-3 font-normal">Date</th>
                  <th className="text-left p-3 font-normal">Method</th>
                  <th className="text-left p-3 font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm">
                {wateringActions.map(action => (
                  <tr key={action.id} className="border-b border-white/5">
                    <td className="p-3">{format(new Date(action.created_date), "MMM d, yyyy h:mm a")}</td>
                    <td className="p-3">
                      <Badge className={`${action.method === "automated" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400"} border-none text-xs`}>
                        {action.method?.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-3">{action.amount_liters ? `${action.amount_liters}L` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WateringForm
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditingWatering(null); }}
        schedule={editingWatering}
        onSubmit={(data) => editingWatering ? updateMutation.mutate({ id: editingWatering.id, data }) : createMutation.mutate(data)}
      />
    </div>
  );
}