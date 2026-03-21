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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const CHALLENGE_TYPES = {
  biggest_flower: "Biggest Flower",
  fastest_veg: "Fastest Veg",
  highest_yield: "Highest Yield",
  best_deficiency_recovery: "Best Deficiency Recovery",
  most_trichomes: "Most Trichomes",
  best_training: "Best Training",
};

const STATUS_COLORS = {
  upcoming: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  voting: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
};

const emptyForm = {
  title: "",
  description: "",
  type: "",
  start_date: "",
  end_date: "",
  status: "upcoming",
  prize_badge: "",
  image_url: "",
  rules: "",
};

export default function Challenges() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Challenge.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["challenges"]); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Challenge.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["challenges"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Challenge.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["challenges"]),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (challenge) => { setEditing(challenge); setForm({ ...challenge }); setDialogOpen(true); };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Challenge</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No challenges yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              {c.image_url && <img src={c.image_url} alt={c.title} className="w-full h-40 object-cover" />}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                  <Badge variant="outline">{CHALLENGE_TYPES[c.type] || c.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {c.description && <p>{c.description}</p>}
                <p>{format(new Date(c.start_date), "MMM d, yyyy")} – {format(new Date(c.end_date), "MMM d, yyyy")}</p>
                {c.prize_badge && <p>🏆 {c.prize_badge}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Challenge" : "New Challenge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} /></div>
            <div><Label>Type *</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CHALLENGE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["upcoming", "active", "voting", "completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date *</Label><Input type="datetime-local" value={form.start_date?.slice(0, 16)} onChange={e => set("start_date", e.target.value)} /></div>
              <div><Label>End Date *</Label><Input type="datetime-local" value={form.end_date?.slice(0, 16)} onChange={e => set("end_date", e.target.value)} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} /></div>
            <div><Label>Rules</Label><Textarea value={form.rules} onChange={e => set("rules", e.target.value)} /></div>
            <div><Label>Prize Badge</Label><Input value={form.prize_badge} onChange={e => set("prize_badge", e.target.value)} /></div>
            <div><Label>Banner Image URL</Label><Input value={form.image_url} onChange={e => set("image_url", e.target.value)} /></div>
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