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
import { Plus, Pencil, Trash2, Star, Trophy } from "lucide-react";

export default function ChallengeEntries() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["challenge-entries"],
    queryFn: () => base44.entities.ChallengeEntry.list("-vote_count"),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date"),
  });

  const challengeMap = Object.fromEntries(challenges.map(c => [c.id, c]));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ChallengeEntry.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["challenge-entries"]); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChallengeEntry.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["challenge-entries"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ChallengeEntry.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["challenge-entries"]),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (entry) => { setEditing(entry); setForm({ ...entry, photos: (entry.photos || []).join(", ") }); setDialogOpen(true); };

  const handleSubmit = () => {
    const data = {
      ...form,
      photos: form.photos ? form.photos.split(",").map(s => s.trim()).filter(Boolean) : [],
      vote_count: Number(form.vote_count) || 0,
      ai_score: form.ai_score ? Number(form.ai_score) : undefined,
      rank: form.rank ? Number(form.rank) : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Challenge Entries</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Entry</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No entries yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Card key={entry.id}>
              {entry.photos?.[0] && (
                <img src={entry.photos[0]} alt={entry.strain_name} className="w-full h-40 object-cover rounded-t-lg" />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{entry.strain_name}</CardTitle>
                    {entry.user_name && <p className="text-sm text-muted-foreground">{entry.user_name}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(entry.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {challengeMap[entry.challenge_id] && (
                    <Badge variant="outline">{challengeMap[entry.challenge_id].title}</Badge>
                  )}
                  {entry.rank && <Badge className="bg-yellow-100 text-yellow-800"><Trophy className="w-3 h-3 mr-1" />#{entry.rank}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {entry.description && <p>{entry.description}</p>}
                <div className="flex gap-4">
                  {entry.vote_count != null && (
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{entry.vote_count} votes</span>
                  )}
                  {entry.ai_score != null && (
                    <span>AI Score: {entry.ai_score}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Entry" : "New Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Challenge *</Label>
              <Select value={form.challenge_id} onValueChange={v => set("challenge_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select challenge" /></SelectTrigger>
                <SelectContent>
                  {challenges.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Strain ID *</Label><Input value={form.strain_id} onChange={e => set("strain_id", e.target.value)} /></div>
            <div><Label>Strain Name *</Label><Input value={form.strain_name} onChange={e => set("strain_name", e.target.value)} /></div>
            <div><Label>Submitter Name</Label><Input value={form.user_name} onChange={e => set("user_name", e.target.value)} /></div>
            <div><Label>Submitter Email</Label><Input value={form.user_email} onChange={e => set("user_email", e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => set("description", e.target.value)} /></div>
            <div><Label>Photo URLs (comma-separated)</Label><Input value={form.photos} onChange={e => set("photos", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Votes</Label><Input type="number" value={form.vote_count} onChange={e => set("vote_count", e.target.value)} /></div>
              <div><Label>AI Score</Label><Input type="number" value={form.ai_score} onChange={e => set("ai_score", e.target.value)} /></div>
              <div><Label>Rank</Label><Input type="number" value={form.rank} onChange={e => set("rank", e.target.value)} /></div>
            </div>
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

function emptyForm() {
  return {
    challenge_id: "",
    strain_id: "",
    strain_name: "",
    user_name: "",
    user_email: "",
    description: "",
    photos: "",
    vote_count: 0,
    ai_score: "",
    rank: "",
  };
}