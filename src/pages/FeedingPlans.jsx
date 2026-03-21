import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";

const STAGE_COLORS = {
  seedling: "bg-green-100 text-green-800",
  vegetative: "bg-blue-100 text-blue-800",
  flowering: "bg-purple-100 text-purple-800",
  flush: "bg-gray-100 text-gray-800",
};

const emptyForm = () => ({
  strain_id: "",
  week: "",
  stage: "",
  target_ec: "",
  target_ph: "",
  notes: "",
  completed: false,
});

export default function FeedingPlans() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["feeding-plans"],
    queryFn: () => base44.entities.FeedingPlan.list("week"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeedingPlan.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["feeding-plans"]); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeedingPlan.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["feeding-plans"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeedingPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["feeding-plans"]),
  });

  const toggleComplete = (plan) => {
    updateMutation.mutate({ id: plan.id, data: { ...plan, completed: !plan.completed } });
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (plan) => { setEditing(plan); setForm({ ...plan, target_ec: plan.target_ec ?? "", target_ph: plan.target_ph ?? "" }); setDialogOpen(true); };

  const handleSubmit = () => {
    const data = {
      ...form,
      week: Number(form.week),
      target_ec: form.target_ec !== "" ? Number(form.target_ec) : undefined,
      target_ph: form.target_ph !== "" ? Number(form.target_ph) : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Group by strain_id
  const byStrain = plans.reduce((acc, p) => {
    const key = p.strain_id || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Feeding Plans</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Week</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No feeding plans yet.</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byStrain).map(([strainId, strainPlans]) => (
            <div key={strainId}>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Strain: {strainId}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {strainPlans.map((plan) => (
                  <Card key={plan.id} className={plan.completed ? "opacity-60" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleComplete(plan)} className="shrink-0">
                            {plan.completed
                              ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                              : <Circle className="w-5 h-5 text-muted-foreground" />}
                          </button>
                          <CardTitle className="text-base">Week {plan.week}</CardTitle>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(plan.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                      <Badge className={STAGE_COLORS[plan.stage]}>{plan.stage}</Badge>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      <div className="flex gap-4">
                        {plan.target_ec != null && <span>EC: <strong>{plan.target_ec}</strong></span>}
                        {plan.target_ph != null && <span>pH: <strong>{plan.target_ph}</strong></span>}
                      </div>
                      {plan.notes && <p>{plan.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Week" : "New Feeding Week"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Strain ID *</Label><Input value={form.strain_id} onChange={e => set("strain_id", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Week *</Label><Input type="number" value={form.week} onChange={e => set("week", e.target.value)} /></div>
              <div>
                <Label>Stage *</Label>
                <Select value={form.stage} onValueChange={v => set("stage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {["seedling", "vegetative", "flowering", "flush"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target EC</Label><Input type="number" step="0.1" value={form.target_ec} onChange={e => set("target_ec", e.target.value)} /></div>
              <div><Label>Target pH</Label><Input type="number" step="0.1" value={form.target_ph} onChange={e => set("target_ph", e.target.value)} /></div>
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