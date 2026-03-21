import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { addDays } from "date-fns";

export default function WateringForm({ open, onOpenChange, onSubmit, schedule }) {
  const [form, setForm] = useState({
    frequency_days: "3",
    last_watered: new Date().toISOString().slice(0, 16),
    notes: "",
    active: true,
  });

  useEffect(() => {
    if (schedule) {
      setForm({
        frequency_days: schedule.frequency_days?.toString() || "3",
        last_watered: schedule.last_watered ? new Date(schedule.last_watered).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        notes: schedule.notes || "",
        active: schedule.active ?? true,
      });
    }
  }, [schedule]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lastWatered = new Date(form.last_watered).toISOString();
    const nextWatering = addDays(new Date(form.last_watered), parseInt(form.frequency_days)).toISOString();
    
    onSubmit({
      frequency_days: parseInt(form.frequency_days),
      last_watered: lastWatered,
      next_watering: nextWatering,
      notes: form.notes || undefined,
      active: form.active,
    });

    if (!schedule) {
      setForm({ frequency_days: "3", last_watered: new Date().toISOString().slice(0, 16), notes: "", active: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">{schedule ? "Edit" : "Add"} Watering Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Frequency (days) *</Label>
              <Input
                type="number"
                min="1"
                value={form.frequency_days}
                onChange={(e) => setForm({ ...form, frequency_days: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Last Watered *</Label>
              <Input
                type="datetime-local"
                value={form.last_watered}
                onChange={(e) => setForm({ ...form, last_watered: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                required
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
              placeholder="Any notes about this schedule..."
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <Label className="text-white/70 text-sm">Enable Alerts</Label>
            <Switch
              checked={form.active}
              onCheckedChange={(checked) => setForm({ ...form, active: checked })}
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
            {schedule ? "Update" : "Create"} Schedule
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}