import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../MobileSelect";

export default function StrainForm({ open, onOpenChange, onSubmit, strain, key }) {
  const [form, setForm] = useState(strain || {
    name: "", type: "hybrid", plant_type: "photoperiod", breeder: "", thc_percentage: "", cbd_percentage: "",
    flowering_time_weeks: "", planted_date: "", flipped_to_flower_date: "", harvest_date: "", status: "active", notes: ""
  });

  React.useEffect(() => {
    if (open && strain) setForm({ ...strain, harvest_date: strain.harvest_date || "", planted_date: strain.planted_date || "", flipped_to_flower_date: strain.flipped_to_flower_date || "" });
    if (open && !strain) setForm({ name: "", type: "hybrid", plant_type: "photoperiod", breeder: "", thc_percentage: "", cbd_percentage: "", flowering_time_weeks: "", planted_date: "", flipped_to_flower_date: "", harvest_date: "", status: "active", notes: "" });
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      type: form.type,
      plant_type: form.plant_type,
      breeder: form.breeder || undefined,
      thc_percentage: form.thc_percentage ? parseFloat(form.thc_percentage) : undefined,
      cbd_percentage: form.cbd_percentage ? parseFloat(form.cbd_percentage) : undefined,
      flowering_time_weeks: form.flowering_time_weeks ? parseInt(form.flowering_time_weeks) : undefined,
      planted_date: form.planted_date || undefined,
      flipped_to_flower_date: form.flipped_to_flower_date || undefined,
      harvest_date: form.harvest_date || undefined,
      status: form.status,
      notes: form.notes || undefined,
    };
    onSubmit(data);
    if (!strain) {
      setForm({ name: "", type: "hybrid", plant_type: "photoperiod", breeder: "", thc_percentage: "", cbd_percentage: "",
        flowering_time_weeks: "", planted_date: "", flipped_to_flower_date: "", harvest_date: "", status: "active", notes: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">{strain ? "Edit Strain" : "Add Strain"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white/50 text-xs">Strain Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Gorilla Glue #4" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Type *</Label>
              <MobileSelect
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
                options={[
                  { value: "indica", label: "Indica" },
                  { value: "sativa", label: "Sativa" },
                  { value: "hybrid", label: "Hybrid" },
                ]}
                placeholder="Select type"
                label="Strain Type"
                className="mt-1 w-full"
              />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Plant Type *</Label>
              <MobileSelect
                value={form.plant_type}
                onValueChange={(v) => setForm({ ...form, plant_type: v })}
                options={[
                  { value: "photoperiod", label: "Photoperiod" },
                  { value: "autoflower", label: "Autoflower" },
                  { value: "fast_flower", label: "Fast Flower" },
                ]}
                placeholder="Select plant type"
                label="Plant Type"
                className="mt-1 w-full"
              />
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Status</Label>
            <MobileSelect
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: "active", label: "Active" },
                { value: "harvested", label: "Harvested" },
                { value: "planned", label: "Planned" },
              ]}
              placeholder="Select status"
              label="Status"
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label className="text-white/50 text-xs">Breeder / Seed Bank</Label>
            <Input value={form.breeder} onChange={(e) => setForm({ ...form, breeder: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Barney's Farm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">THC %</Label>
              <Input type="number" step="0.1" value={form.thc_percentage} onChange={(e) => setForm({ ...form, thc_percentage: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs">CBD %</Label>
              <Input type="number" step="0.1" value={form.cbd_percentage} onChange={(e) => setForm({ ...form, cbd_percentage: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Flowering Time (weeks)</Label>
            <Input type="number" value={form.flowering_time_weeks} onChange={(e) => setForm({ ...form, flowering_time_weeks: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. 8" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Planted Date</Label>
              <div className="relative mt-1">
                <Input type="date" value={form.planted_date || ""} onChange={(e) => setForm({ ...form, planted_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white pr-8" />
                {form.planted_date && (
                  <button type="button" onClick={() => setForm({ ...form, planted_date: "" })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-lg leading-none">×</button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Flipped to Flower</Label>
              <div className="relative mt-1">
                <Input type="date" value={form.flipped_to_flower_date || ""} onChange={(e) => setForm({ ...form, flipped_to_flower_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white pr-8" />
                {form.flipped_to_flower_date && (
                  <button type="button" onClick={() => setForm({ ...form, flipped_to_flower_date: "" })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-lg leading-none">×</button>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Harvest Date</Label>
            <div className="relative mt-1">
              <Input type="date" value={form.harvest_date || ""} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white pr-8" />
              {form.harvest_date && (
                <button type="button" onClick={() => setForm({ ...form, harvest_date: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-lg leading-none">×</button>
              )}
            </div>
          </div>
          <div>
            <Label className="text-white/50 text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none" rows={2} />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            {strain ? "Update Strain" : "Add Strain"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}