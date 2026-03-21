import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import MobileSelect from "../MobileSelect";

const nutrientTypes = [
  { value: "base", label: "Base" },
  { value: "bloom", label: "Bloom" },
  { value: "grow", label: "Grow" },
  { value: "cal-mag", label: "Cal-Mag" },
  { value: "silica", label: "Silica" },
  { value: "enzyme", label: "Enzyme" },
  { value: "beneficial", label: "Beneficial" },
  { value: "pH_up", label: "pH Up" },
  { value: "pH_down", label: "pH Down" },
  { value: "other", label: "Other" },
];

export default function NutrientForm({ open, onOpenChange, onSubmit, nutrient: editingNutrient }) {
  const [nutrients, setNutrients] = useState([{
    nutrient_name: "", brand: "", volume_ml: "", nutrient_type: "base"
  }]);
  const [waterVolume, setWaterVolume] = useState("");
  const [growStage, setGrowStage] = useState("vegetative");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingNutrient) {
      setNutrients([{
        nutrient_name: editingNutrient.nutrient_name || "",
        brand: editingNutrient.brand || "",
        volume_ml: editingNutrient.volume_ml?.toString() || "",
        nutrient_type: editingNutrient.nutrient_type || "base"
      }]);
      setWaterVolume(editingNutrient.water_volume_liters?.toString() || "");
      setGrowStage(editingNutrient.grow_stage || "vegetative");
      setNotes(editingNutrient.notes || "");
    }
  }, [editingNutrient]);

  const addNutrient = () => {
    setNutrients([...nutrients, { nutrient_name: "", brand: "", volume_ml: "", nutrient_type: "base" }]);
  };

  const removeNutrient = (index) => {
    setNutrients(nutrients.filter((_, i) => i !== index));
  };

  const updateNutrient = (index, field, value) => {
    const updated = [...nutrients];
    updated[index][field] = value;
    setNutrients(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validNutrients = nutrients.filter(n => n.nutrient_name && n.volume_ml);
    
    if (validNutrients.length === 0) {
      alert("Please add at least one nutrient");
      return;
    }

    if (editingNutrient) {
      onSubmit({
        nutrient_name: validNutrients[0].nutrient_name,
        brand: validNutrients[0].brand || undefined,
        volume_ml: parseFloat(validNutrients[0].volume_ml),
        water_volume_liters: waterVolume ? parseFloat(waterVolume) : undefined,
        nutrient_type: validNutrients[0].nutrient_type,
        grow_stage: growStage,
        notes: notes || undefined,
      });
    } else {
      onSubmit({
        nutrients: validNutrients.map(n => ({
          nutrient_name: n.nutrient_name,
          brand: n.brand || undefined,
          volume_ml: parseFloat(n.volume_ml),
          water_volume_liters: waterVolume ? parseFloat(waterVolume) : undefined,
          nutrient_type: n.nutrient_type,
          grow_stage: growStage,
          notes: notes || undefined,
        }))
      });
    }

    if (!editingNutrient) {
      setNutrients([{ nutrient_name: "", brand: "", volume_ml: "", nutrient_type: "base" }]);
      setWaterVolume("");
      setGrowStage("vegetative");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">{editingNutrient ? "Edit" : "Log"} Nutrients</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {nutrients.map((n, index) => (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-sm">Nutrient #{index + 1}</Label>
                  {nutrients.length > 1 && (
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => removeNutrient(index)}
                      className="text-red-400 hover:text-red-300 h-7 px-2">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/50 text-xs">Product Name *</Label>
                    <Input
                      value={n.nutrient_name}
                      onChange={(e) => updateNutrient(index, "nutrient_name", e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      placeholder="e.g. Tiger Bloom"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs">Brand</Label>
                    <Input
                      value={n.brand}
                      onChange={(e) => updateNutrient(index, "brand", e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      placeholder="e.g. Fox Farm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/50 text-xs">Type</Label>
                    <MobileSelect
                      value={n.nutrient_type}
                      onValueChange={(v) => updateNutrient(index, "nutrient_type", v)}
                      options={nutrientTypes}
                      placeholder="Select type"
                      label="Nutrient Type"
                      className="mt-1 w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs">Amount (ml) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={n.volume_ml}
                      onChange={(e) => updateNutrient(index, "volume_ml", e.target.value)}
                      className="bg-white/5 border-white/10 text-white mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!editingNutrient && (
            <Button type="button" onClick={addNutrient} variant="outline" size="sm"
              className="border-white/10 text-white hover:bg-white/5 w-full">
              <Plus className="w-3 h-3 mr-2" /> Add Another Nutrient
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/50 text-xs">Water Volume (L)</Label>
              <Input
                type="number"
                step="0.1"
                value={waterVolume}
                onChange={(e) => setWaterVolume(e.target.value)}
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/50 text-xs">Growth Stage</Label>
              <MobileSelect
                value={growStage}
                onValueChange={setGrowStage}
                options={[
                  { value: "seedling", label: "🌱 Seedling" },
                  { value: "vegetative", label: "🌿 Vegetative" },
                  { value: "flowering", label: "🌸 Flowering" },
                  { value: "harvest", label: "🌾 Harvest" },
                ]}
                placeholder="Select stage"
                label="Growth Stage"
                className="mt-1 w-full"
              />
            </div>
          </div>

          <div>
            <Label className="text-white/50 text-xs">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            {editingNutrient ? "Update" : "Log"} Nutrients
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}