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
import { Plus, Pencil, Trash2, Thermometer, Droplets } from "lucide-react";
import { format } from "date-fns";

const STAGE_COLORS = {
  germination: "bg-yellow-100 text-yellow-800",
  seedling: "bg-green-100 text-green-800",
  vegetative: "bg-emerald-100 text-emerald-800",
  flowering: "bg-pink-100 text-pink-800",
  harvest: "bg-orange-100 text-orange-800",
};

const emptyForm = () => ({
  strain_id: "", date: "", temperature: "", humidity: "",
  ppfd: "", ec: "", vpd: "", ph: "", grow_stage: "", notes: "",
});

export default function GrowReadings() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ["grow-readings"],
    queryFn: () => base44.entities.GrowReading.list("-date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GrowReading.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["grow-readings"]); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GrowReading.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["grow-readings"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GrowReading.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["grow-readings"]),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ ...r, date: r.date?.slice(0, 16) || "" }); setDialogOpen(true); };

  const handleSubmit = () => {
    const data = {
      ...form,
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      ppfd: form.ppfd !== "" ? Number(form.ppfd) : undefined,
      ec: form.ec !== "" ? Number(form.ec) : undefined,
      vpd: form.vpd !== "" ? Number(form.vpd) : undefined,
      ph: form.ph !== "" ? Number(form.ph) : undefined,
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
        <h1 className="text-3xl font-bold">Grow Readings</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Reading</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : readings.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No readings yet.</div>
      ) : (
        <div className="space-y-3">
          {readings.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {r.grow_stage && <Badge className={STAGE_COLORS[r.grow_stage]}>{r.grow_stage}</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {r.date ? format(new Date(r.date), "MMM d, yyyy HH:mm") : "No date"}
                      </span>
                      <span className="text-xs text-muted-foreground">Strain: {r.strain_id}</span>
                    </div>
                    <div className="flex gap-4 flex-wrap text-sm font-medium">
                      <span className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" />{r.temperature}°F</span>
                      <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-500" />{r.humidity}%</span>
                      {r.ph != null && <span>pH {r.ph}</span>}
                      {r.ec != null && <span>EC {r.ec} mS/cm</span>}
                      {r.vpd != null && <span>VPD {r.vpd} kPa</span>}
                      {r.ppfd != null && <span>PPFD {r.ppfd}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              {r.notes && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{r.notes}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Reading" : "New Reading"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Strain ID *</Label><Input value={form.strain_id} onChange={e => set("strain_id", e.target.value)} /></div>
            <div><Label>Date</Label><Input type="datetime-local" value={form.date} onChange={e => set("date", e.target.value)} /></div>
            <div>
              <Label>Grow Stage</Label>
              <Select value={form.grow_stage || ""} onValueChange={v => set("grow_stage", v)}>
                <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                <SelectContent>
                  {["germination", "seedling", "vegetative", "flowering", "harvest"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Temperature (°F) *</Label><Input type="number" value={form.temperature} onChange={e => set("temperature", e.target.value)} /></div>
              <div><Label>Humidity (%) *</Label><Input type="number" value={form.humidity} onChange={e => set("humidity", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.1" value={form.ph} onChange={e => set("ph", e.target.value)} /></div>
              <div><Label>EC (mS/cm)</Label><Input type="number" step="0.1" value={form.ec} onChange={e => set("ec", e.target.value)} /></div>
              <div><Label>VPD (kPa)</Label><Input type="number" step="0.01" value={form.vpd} onChange={e => set("vpd", e.target.value)} /></div>
              <div><Label>PPFD (µmol/m²/s)</Label><Input type="number" value={form.ppfd} onChange={e => set("ppfd", e.target.value)} /></div>
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