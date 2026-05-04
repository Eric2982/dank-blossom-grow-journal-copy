import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ReadingCard from "../ReadingCard";
import ReadingsChart from "../ReadingsChart";
import ReadingsHistory from "../ReadingsHistory";
import AddReadingDialog from "../AddReadingDialog";

export default function GrowLogSection({ strainId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const queryClient = useQueryClient();

  const { data: readings = [] } = useQuery({
    queryKey: ["readings", strainId],
    queryFn: () => base44.entities.GrowReading.filter({ strain_id: strainId }, "-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GrowReading.create({ ...data, strain_id: strainId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["readings", strainId] }); setShowForm(false); setEditingReading(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GrowReading.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["readings", strainId] }); setShowForm(false); setEditingReading(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GrowReading.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["readings", strainId] }),
  });

  const latest = readings[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-white">Grow Log</h2>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
          <Plus className="w-3 h-3" /> Log Reading
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {["temperature", "humidity", "ppfd", "ec", "vpd", "ph"].map(type => (
          <ReadingCard key={type} type={type} value={latest?.[type]} />
        ))}
      </div>
      <ReadingsChart readings={readings} />
      <ReadingsHistory
        readings={readings}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={(r) => { setEditingReading(r); setShowForm(true); }}
      />
      <AddReadingDialog
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditingReading(null); }}
        reading={editingReading}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data) => editingReading ? updateMutation.mutate({ id: editingReading.id, data }) : createMutation.mutate(data)}
      />
    </div>
  );
}