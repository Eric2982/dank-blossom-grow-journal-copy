import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MobileSelect from "@/components/MobileSelect";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Trash2, Edit } from "lucide-react";

export default function FeedingPlanner({ strainId, plans, onCreatePlan, onUpdatePlan, onDeletePlan }) {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    week: "1",
    stage: "vegetative",
    target_ec: "",
    target_ph: "6.0",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      strain_id: strainId,
      week: parseInt(form.week),
      stage: form.stage,
      target_ec: form.target_ec ? parseFloat(form.target_ec) : undefined,
      target_ph: parseFloat(form.target_ph),
      notes: form.notes || undefined,
      completed: false,
    };

    if (editingPlan) {
      onUpdatePlan({ id: editingPlan.id, data });
    } else {
      onCreatePlan(data);
    }
    
    setShowForm(false);
    setEditingPlan(null);
    setForm({ week: "1", stage: "vegetative", target_ec: "", target_ph: "6.0", notes: "" });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      week: plan.week.toString(),
      stage: plan.stage,
      target_ec: plan.target_ec?.toString() || "",
      target_ph: plan.target_ph?.toString() || "6.0",
      notes: plan.notes || "",
    });
    setShowForm(true);
  };

  const toggleComplete = (plan) => {
    onUpdatePlan({ id: plan.id, data: { ...plan, completed: !plan.completed } });
  };

  const sortedPlans = [...plans].sort((a, b) => a.week - b.week);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-white">Feeding Schedule</h2>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-500">
          <Plus className="w-4 h-4 mr-2" /> Add Week
        </Button>
      </div>

      {sortedPlans.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <p className="text-white/30 text-sm">No feeding plan yet. Create a weekly schedule.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr className="text-white/40 text-xs">
                  <th className="text-left p-3 font-normal">Week</th>
                  <th className="text-left p-3 font-normal">Stage</th>
                  <th className="text-left p-3 font-normal">Target EC</th>
                  <th className="text-left p-3 font-normal">Target pH</th>
                  <th className="text-left p-3 font-normal">Notes</th>
                  <th className="text-left p-3 font-normal">Status</th>
                  <th className="text-left p-3 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white text-sm">
                {sortedPlans.map((plan) => (
                  <tr key={plan.id} className={`border-b border-white/5 hover:bg-white/[0.02] ${plan.completed ? 'opacity-50' : ''}`}>
                    <td className="p-3 font-medium">Week {plan.week}</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-xs">
                        {plan.stage}
                      </Badge>
                    </td>
                    <td className="p-3">{plan.target_ec ? `${plan.target_ec} mS/cm` : "—"}</td>
                    <td className="p-3">{plan.target_ph || "—"}</td>
                    <td className="p-3 text-white/40 text-xs max-w-xs truncate">{plan.notes || "—"}</td>
                    <td className="p-3">
                      <Button
                        onClick={() => toggleComplete(plan)}
                        size="sm"
                        variant="ghost"
                        className={`h-7 px-2 ${plan.completed ? 'text-emerald-400' : 'text-white/20'}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button onClick={() => handleEdit(plan)} size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-white">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button onClick={() => onDeletePlan(plan.id)} size="sm" variant="ghost" className="h-7 px-2 text-white/20 hover:text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingPlan(null); }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-light text-xl">{editingPlan ? "Edit" : "Add"} Week</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/50 text-xs">Week Number *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.week}
                  onChange={(e) => setForm({ ...form, week: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-white/50 text-xs">Stage *</Label>
                <MobileSelect
                  value={form.stage}
                  onValueChange={(v) => setForm({ ...form, stage: v })}
                  options={[
                    { value: "seedling", label: "Seedling" },
                    { value: "vegetative", label: "Vegetative" },
                    { value: "flowering", label: "Flowering" },
                    { value: "flush", label: "Flush" }
                  ]}
                  placeholder="Select stage"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/50 text-xs">Target EC (mS/cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.target_ec}
                  onChange={(e) => setForm({ ...form, target_ec: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="1.5"
                />
              </div>
              <div>
                <Label className="text-white/50 text-xs">Target pH</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.target_ph}
                  onChange={(e) => setForm({ ...form, target_ph: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="6.0"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 resize-none"
                rows={2}
                placeholder="Feeding instructions for this week..."
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              {editingPlan ? "Update" : "Add"} Week
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}