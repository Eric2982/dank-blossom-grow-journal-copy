import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Droplet, Trash2, Check } from "lucide-react";
import { format, addDays, differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import WateringForm from "./WateringForm";

export default function WateringReminders() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ["watering"],
    queryFn: () => base44.entities.WateringSchedule.list("-next_watering", 50),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WateringSchedule.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watering"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WateringSchedule.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watering"] }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WateringSchedule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watering"] });
      setShowForm(false);
    },
  });

  const handleWatered = (schedule) => {
    const now = new Date().toISOString();
    const nextWatering = addDays(new Date(), schedule.frequency_days).toISOString();
    updateMutation.mutate({
      id: schedule.id,
      data: { last_watered: now, next_watering: nextWatering },
    });
  };

  const getStatus = (nextWatering) => {
    const hours = differenceInHours(new Date(nextWatering), new Date());
    if (hours < 0) return { label: "Overdue", color: "bg-red-500/15 text-red-400 border-red-500/20" };
    if (hours < 24) return { label: "Due Soon", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" };
    return { label: "Scheduled", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" };
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-medium">Watering Schedule</h3>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 h-7 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">No watering schedules yet</p>
      ) : (
        <div className="space-y-3">
          {schedules.filter(s => s.active).map((schedule) => {
            const status = getStatus(schedule.next_watering);
            return (
              <div key={schedule.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Droplet className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{schedule.plant_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${status.color} border text-[10px]`}>{status.label}</Badge>
                    <span className="text-white/30 text-xs">
                      Next: {format(new Date(schedule.next_watering), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleWatered(schedule)}
                  className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(schedule.id)}
                  className="h-7 w-7 p-0 text-white/20 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <WateringForm open={showForm} onOpenChange={setShowForm} onSubmit={(data) => createMutation.mutate(data)} />
    </div>
  );
}