import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import NutrientForm from "../NutrientForm";

export default function NutrientsSection({ strainId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingNutrient, setEditingNutrient] = useState(null);
  const [collapsedDates, setCollapsedDates] = useState({});
  const queryClient = useQueryClient();

  const { data: nutrients = [] } = useQuery({
    queryKey: ["nutrients", strainId],
    queryFn: () => base44.entities.NutrientLog.filter({ strain_id: strainId }, "-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (data.nutrients) await Promise.all(data.nutrients.map(n => base44.entities.NutrientLog.create({ ...n, strain_id: strainId })));
      else await base44.entities.NutrientLog.create({ ...data, strain_id: strainId });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] }); setShowForm(false); setEditingNutrient(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NutrientLog.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] }); setShowForm(false); setEditingNutrient(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutrientLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutrients", strainId] }),
  });

  const nutrientsByDate = useMemo(() => {
    const groups = {};
    nutrients.forEach(n => {
      const k = format(new Date(n.created_date), "MMM d, yyyy");
      if (!groups[k]) groups[k] = [];
      groups[k].push(n);
    });
    return groups;
  }, [nutrients]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-white">Nutrients</h2>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5 gap-2">
          <Plus className="w-3 h-3" /> Add Nutrient
        </Button>
      </div>

      {nutrients.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
          <p className="text-white/30 text-sm">No nutrients logged yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(nutrientsByDate).map(([dateKey, items]) => {
            const isCollapsed = collapsedDates[dateKey];
            return (
              <div key={dateKey} className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setCollapsedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }))}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm font-medium">{dateKey}</span>
                    <span className="text-white/30 text-xs">{items.length} nutrient{items.length > 1 ? "s" : ""}</span>
                  </div>
                  {isCollapsed ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronUp className="w-4 h-4 text-white/30" />}
                </button>
                {!isCollapsed && (
                  <div className="border-t border-white/5 overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/5">
                        <tr className="text-white/40 text-xs">
                          <th className="text-left p-3 font-normal">Nutrient</th>
                          <th className="text-left p-3 font-normal">Type</th>
                          <th className="text-left p-3 font-normal">Amount</th>
                          <th className="text-left p-3 font-normal">Stage</th>
                          <th className="text-left p-3 font-normal">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-white text-sm">
                        {items.map(n => (
                          <tr key={n.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="p-3">{n.nutrient_name} {n.brand && <span className="text-white/40">({n.brand})</span>}</td>
                            <td className="p-3">{n.nutrient_type}</td>
                            <td className="p-3">{n.volume_ml}ml</td>
                            <td className="p-3">{n.grow_stage}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button onClick={() => { setEditingNutrient(n); setShowForm(true); }} size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-white"><Edit className="w-3 h-3" /></Button>
                                <Button onClick={() => deleteMutation.mutate(n.id)} size="sm" variant="ghost" className="h-7 px-2 text-white/20 hover:text-red-400"><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NutrientForm
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditingNutrient(null); }}
        nutrient={editingNutrient}
        onSubmit={(data) => editingNutrient ? updateMutation.mutate({ id: editingNutrient.id, data }) : createMutation.mutate(data)}
      />
    </div>
  );
}