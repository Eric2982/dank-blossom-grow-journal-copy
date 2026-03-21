import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MobileSelect from "@/components/MobileSelect";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

const effects = ["Relaxed", "Happy", "Euphoric", "Energetic", "Focused", "Creative", "Sleepy", "Hungry", "Uplifted"];
const terpenes = ["Myrcene", "Limonene", "Caryophyllene", "Pinene", "Linalool", "Humulene", "Terpinolene"];

export default function HarvestTracker({ strainId, harvests, onCreateHarvest, onUpdateHarvest, onDeleteHarvest }) {
  const [showForm, setShowForm] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [form, setForm] = useState({
    harvest_date: new Date().toISOString().slice(0, 10),
    wet_weight_grams: "",
    dry_weight_grams: "",
    cured_weight_grams: "",
    dry_date: "",
    cure_date: "",
    quality_rating: "7",
    trichome_color: "cloudy",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      strain_id: strainId,
      harvest_date: form.harvest_date,
      wet_weight_grams: form.wet_weight_grams ? parseFloat(form.wet_weight_grams) : undefined,
      dry_weight_grams: form.dry_weight_grams ? parseFloat(form.dry_weight_grams) : undefined,
      cured_weight_grams: form.cured_weight_grams ? parseFloat(form.cured_weight_grams) : undefined,
      dry_date: form.dry_date || undefined,
      cure_date: form.cure_date || undefined,
      quality_rating: parseInt(form.quality_rating),
      trichome_color: form.trichome_color,
      notes: form.notes || undefined,
    };

    if (editingHarvest) {
      onUpdateHarvest({ id: editingHarvest.id, data });
    } else {
      onCreateHarvest(data);
    }
    
    setShowForm(false);
    setEditingHarvest(null);
    setForm({
      harvest_date: new Date().toISOString().slice(0, 10),
      wet_weight_grams: "", dry_weight_grams: "", cured_weight_grams: "",
      dry_date: "", cure_date: "", quality_rating: "7", trichome_color: "cloudy", notes: ""
    });
  };

  const handleEdit = (harvest) => {
    setEditingHarvest(harvest);
    setForm({
      harvest_date: harvest.harvest_date || new Date().toISOString().slice(0, 10),
      wet_weight_grams: harvest.wet_weight_grams?.toString() || "",
      dry_weight_grams: harvest.dry_weight_grams?.toString() || "",
      cured_weight_grams: harvest.cured_weight_grams?.toString() || "",
      dry_date: harvest.dry_date || "",
      cure_date: harvest.cure_date || "",
      quality_rating: harvest.quality_rating?.toString() || "7",
      trichome_color: harvest.trichome_color || "cloudy",
      notes: harvest.notes || "",
    });
    setShowForm(true);
  };

  const calculateYield = (harvest) => {
    const wet = harvest.wet_weight_grams || 0;
    const dry = harvest.dry_weight_grams || 0;
    const cured = harvest.cured_weight_grams || 0;
    
    if (wet && dry) {
      const dryPercent = ((dry / wet) * 100).toFixed(1);
      return { final: cured || dry, dryPercent };
    }
    return { final: cured || dry, dryPercent: null };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-white">Harvest & Yield</h2>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-amber-600 hover:bg-amber-500">
          <Plus className="w-4 h-4 mr-2" /> Log Harvest
        </Button>
      </div>

      {harvests.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Award className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No harvests logged yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {harvests.map((harvest) => {
            const { final, dryPercent } = calculateYield(harvest);
            return (
              <div key={harvest.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-white font-medium">
                        Harvest - {format(new Date(harvest.harvest_date), "MMM d, yyyy")}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-amber-500/10 text-amber-400 border-none text-xs">
                          {harvest.trichome_color}
                        </Badge>
                        <Badge className="bg-purple-500/10 text-purple-400 border-none text-xs">
                          Quality: {harvest.quality_rating}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(harvest)} size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-white">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button onClick={() => onDeleteHarvest(harvest.id)} size="sm" variant="ghost" className="h-7 px-2 text-white/20 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-white/40 text-xs mb-1">Wet Weight</div>
                    <div className="text-white text-lg font-light">
                      {harvest.wet_weight_grams ? `${harvest.wet_weight_grams}g` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Dry Weight</div>
                    <div className="text-white text-lg font-light">
                      {harvest.dry_weight_grams ? `${harvest.dry_weight_grams}g` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Cured Weight</div>
                    <div className="text-white text-lg font-light">
                      {harvest.cured_weight_grams ? `${harvest.cured_weight_grams}g` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Yield %</div>
                    <div className="text-emerald-400 text-lg font-light">
                      {dryPercent ? `${dryPercent}%` : "—"}
                    </div>
                  </div>
                </div>

                {harvest.notes && (
                  <p className="mt-4 text-white/50 text-sm border-t border-white/5 pt-4">
                    {harvest.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingHarvest(null); }}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-light text-xl">{editingHarvest ? "Edit" : "Log"} Harvest</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white/50 text-xs">Harvest Date *</Label>
              <Input
                type="date"
                value={form.harvest_date}
                onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-white/50 text-xs">Wet Weight (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.wet_weight_grams}
                  onChange={(e) => setForm({ ...form, wet_weight_grams: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/50 text-xs">Dry Weight (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.dry_weight_grams}
                  onChange={(e) => setForm({ ...form, dry_weight_grams: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/50 text-xs">Cured (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.cured_weight_grams}
                  onChange={(e) => setForm({ ...form, cured_weight_grams: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/50 text-xs">Dry Date</Label>
                <Input
                  type="date"
                  value={form.dry_date}
                  onChange={(e) => setForm({ ...form, dry_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/50 text-xs">Cure Date</Label>
                <Input
                  type="date"
                  value={form.cure_date}
                  onChange={(e) => setForm({ ...form, cure_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/50 text-xs">Quality (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={form.quality_rating}
                  onChange={(e) => setForm({ ...form, quality_rating: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white/50 text-xs">Trichome Color</Label>
                <MobileSelect
                  value={form.trichome_color}
                  onValueChange={(v) => setForm({ ...form, trichome_color: v })}
                  options={[
                    { value: "clear", label: "Clear" },
                    { value: "cloudy", label: "Cloudy" },
                    { value: "amber", label: "Amber" },
                    { value: "mixed", label: "Mixed" }
                  ]}
                  placeholder="Select color"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/50 text-xs">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white mt-1 resize-none"
                rows={3}
                placeholder="Smell, taste, effects, overall quality..."
              />
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white">
              {editingHarvest ? "Update" : "Log"} Harvest
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}