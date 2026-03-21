import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ThumbsUp } from "lucide-react";

export default function ChallengeVotes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ entry_id: "", challenge_id: "", voter_email: "" });

  const { data: votes = [], isLoading } = useQuery({
    queryKey: ["challenge-votes"],
    queryFn: () => base44.entities.ChallengeVote.list("-created_date"),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date"),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["challenge-entries"],
    queryFn: () => base44.entities.ChallengeEntry.list("-created_date"),
  });

  const challengeMap = Object.fromEntries(challenges.map(c => [c.id, c]));
  const entryMap = Object.fromEntries(entries.map(e => [e.id, e]));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ChallengeVote.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["challenge-votes"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ChallengeVote.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["challenge-votes"]),
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Challenge Votes</h1>
        <Button onClick={() => { setForm({ entry_id: "", challenge_id: "", voter_email: "" }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Vote
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : votes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No votes yet.</div>
      ) : (
        <div className="space-y-3">
          {votes.map((vote) => (
            <Card key={vote.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-4 h-4 text-green-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        {entryMap[vote.entry_id]?.strain_name ?? vote.entry_id}
                      </p>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {challengeMap[vote.challenge_id] && (
                          <Badge variant="outline" className="text-xs">{challengeMap[vote.challenge_id].title}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{vote.voter_email}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(vote.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vote</DialogTitle>
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
            <div>
              <Label>Entry *</Label>
              <Select value={form.entry_id} onValueChange={v => set("entry_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select entry" /></SelectTrigger>
                <SelectContent>
                  {entries
                    .filter(e => !form.challenge_id || e.challenge_id === form.challenge_id)
                    .map(e => <SelectItem key={e.id} value={e.id}>{e.strain_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Voter Email *</Label>
              <Input value={form.voter_email} onChange={e => set("voter_email", e.target.value)} placeholder="voter@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)}>Submit Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}