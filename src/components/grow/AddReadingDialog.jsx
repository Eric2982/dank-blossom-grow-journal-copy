import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../MobileSelect";

const fields = [
  { key: "temperature", label: "Temperature (°F)", type: "number", step: "0.1" },
  { key: "humidity", label: "Humidity (%)", type: "number", step: "0.1" },
  { key: "ppfd", label: "PPFD (µmol/m²/s)", type: "number", step: "1" },
  { key: "ec", label: "EC (mS/cm)", type: "number", step: "0.01" },
  { key: "vpd", label: "VPD (kPa)", type: "number", step: "0.01" },
  { key: "ph", label: "pH", type: "number", step: "0.1" },
];

export default function AddReadingDialog({ open, onOpenChange, onSubmit, reading }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    temperature: "", humidity: "", ppfd: "", ec: "", vpd: "", ph: "",
    grow_stage: "vegetative", notes: ""
  });

  useEffect(() => {
    if (reading) {
      setForm({
        date: reading.date ? new Date(reading.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        temperature: reading.temperature?.toString() || "",
        humidity: reading.humidity?.toString() || "",
        ppfd: reading.ppfd?.toString() || "",
        ec: reading.ec?.toString() || "",
        vpd: reading.vpd?.toString() || "",
        ph: reading.ph?.toString() || "",
        grow_stage: reading.grow_stage || "vegetative",
        notes: reading.notes || "",
      });
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 16),
        temperature: "", humidity: "", ppfd: "", ec: "", vpd: "", ph: "",
        grow_stage: "vegetative", notes: ""
      });
    }
  }, [reading, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { date: new Date(form.date).toISOString() };
    fields.forEach(f => {
      if (form[f.key] !== "") data[f.key] = parseFloat(form[f.key]);
    });
    data.grow_stage = form.grow_stage;
    if (form.notes) data.notes = form.notes;
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">{reading ? "Edit" : "Log"} Reading</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white/50 text-xs">Date & Time</Label>
            <Input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key}>
                <Label className="text-white/50 text-xs">{f.label}</Label>
                <Input
                  type={f.type}
                  step={f.step}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  placeholder="—"
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="text-white/50 text-xs">Growth Stage</Label>
            <MobileSelect
              value={form.grow_stage}
              onValueChange={(v) => setForm({ ...form, grow_stage: v })}
              options={[
                { value: "germination", label: "🥚 Germination" },
                { value: "seedling", label: "🌱 Seedling" },
                { value: "vegetative", label: "🌿 Vegetative" },
                { value: "flowering", label: "🌸 Flowering" },
                { value: "harvest", label: "🌾 Harvest" },
              ]}
              placeholder="Select growth stage"
              label="Growth Stage"
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label className="text-white/50 text-xs">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none"
              rows={2}
              placeholder="Observations..."
            />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            {reading ? "Update" : "Save"} Reading
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}