import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, FlaskConical } from "lucide-react";
import { format } from "date-fns";

const TYPE_COLORS = {
  base: "bg-blue-100 text-blue-800",
  bloom: "bg-pink-100 text-pink-800",
  grow: "bg-green-100 text-green-800",
  "cal-mag": "bg-yellow-100 text-yellow-800",
  silica: "bg-gray-100 text-gray-800",
  enzyme: "bg-purple-100 text-purple-800",
  beneficial: "bg-emerald-100 text-emerald-800",
  pH_up: "bg-orange-100 text-orange-800",
  pH_down: "bg-red-100 text-red-800",
  other: "bg-slate-100 text-slate-800",
};

const NUTRIENT_TYPES = ["base", "bloom", "grow", "cal-mag", "silica", "enzyme", "beneficial", "pH_up", "pH_down", "other"];
const GROW_STAGES = ["seedling", "vegetative", "flowering", "harvest"];

const emptyForm = () => ({
  strain_id: "", nutrient_name: "", brand: "",
  volume_ml: "", water_volume_liters: "",
  nutrient_type: "", grow_stage: "", notes: "",
});

export default function NutrientLogs() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["nutrient-logs"],
    queryFn: () => base44.entities.NutrientLog.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NutrientLog.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["nutrient-logs"]); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NutrientLog.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["nutrient-logs"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutrientLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["nutrient-logs"]),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (log) => { setEditing(log); setForm({ ...log }); setDialogOpen(true); };

  const handleSubmit = () => {
    const data = {
      ...form,
      volume_ml: Number(form.volume_ml),
      water_volume_liters: form.water_volume_liters !== "" ? Number(form.water_volume_liters) : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Nutrient Logs</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Log</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No nutrient logs yet.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <FlaskConical className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{log.nutrient_name}</span>
                      {log.brand && <span className="text-sm text-muted-foreground">by {log.brand}</span>}
                      {log.nutrient_type && <Badge className={TYPE_COLORS[log.nutrient_type]}>{log.nutrient_type}</Badge>}
                      {log.grow_stage && <Badge variant="outline">{log.grow_stage}</Badge>}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>{log.volume_ml} ml</span>
                      {log.water_volume_liters != null && <span>in {log.water_volume_liters}L water</span>}
                      <span>Strain: {log.strain_id}</span>
                      {log.created_date && <span>{format(new Date(log.created_date), "MMM d, yyyy")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(log)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(log.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              {log.notes && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Log" : "New Nutrient Log"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Strain ID *</Label><Input value={form.strain_id} onChange={e => set("strain_id", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nutrient Name *</Label><Input value={form.nutrient_name} onChange={e => set("nutrient_name", e.target.value)} /></div>
              <div><Label>Brand</Label><Input value={form.brand} onChange={e => set("brand", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.nutrient_type || ""} onValueChange={v => set("nutrient_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {NUTRIENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grow Stage</Label>
                <Select value={form.grow_stage || ""} onValueChange={v => set("grow_stage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {GROW_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Volume (ml) *</Label><Input type="number" value={form.volume_ml} onChange={e => set("volume_ml", e.target.value)} /></div>
              <div><Label>Water Volume (L)</Label><Input type="number" value={form.water_volume_liters} onChange={e => set("water_volume_liters", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}