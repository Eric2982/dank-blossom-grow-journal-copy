import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, User, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function LeaderboardDialog({ challenge, open, onClose }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["challengeEntries", challenge.id],
    queryFn: () => base44.entities.ChallengeEntry.filter({ challenge_id: challenge.id }),
    enabled: open,
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["myVotes", challenge.id, user?.email],
    queryFn: () => base44.entities.ChallengeVote.filter({ 
      challenge_id: challenge.id,
      voter_email: user.email 
    }),
    enabled: !!user?.email && open,
  });

  const voteMutation = useMutation({
    mutationFn: async (entryId) => {
      const existingVote = myVotes.find(v => v.entry_id === entryId);
      if (existingVote) {
        await base44.entities.ChallengeVote.delete(existingVote.id);
        const entry = entries.find(e => e.id === entryId);
        await base44.entities.ChallengeEntry.update(entryId, {
          vote_count: Math.max(0, (entry.vote_count || 0) - 1)
        });
      } else {
        await base44.entities.ChallengeVote.create({
          entry_id: entryId,
          challenge_id: challenge.id,
          voter_email: user.email,
        });
        const entry = entries.find(e => e.id === entryId);
        await base44.entities.ChallengeEntry.update(entryId, {
          vote_count: (entry.vote_count || 0) + 1
        });
      }
    },
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: ["challengeEntries", challenge.id] });
      await queryClient.cancelQueries({ queryKey: ["myVotes", challenge.id, user?.email] });

      const prevEntries = queryClient.getQueryData(["challengeEntries", challenge.id]);
      const prevVotes = queryClient.getQueryData(["myVotes", challenge.id, user?.email]);

      const existingVote = myVotes.find(v => v.entry_id === entryId);
      queryClient.setQueryData(["challengeEntries", challenge.id], (old = []) =>
        old.map(e => e.id === entryId
          ? { ...e, vote_count: Math.max(0, (e.vote_count || 0) + (existingVote ? -1 : 1)) }
          : e
        )
      );
      if (existingVote) {
        queryClient.setQueryData(["myVotes", challenge.id, user?.email], (old = []) =>
          old.filter(v => v.entry_id !== entryId)
        );
      } else {
        queryClient.setQueryData(["myVotes", challenge.id, user?.email], (old = []) => [
          ...old,
          { entry_id: entryId, challenge_id: challenge.id, voter_email: user.email, id: `optimistic-${Date.now()}` }
        ]);
      }
      return { prevEntries, prevVotes };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevEntries) queryClient.setQueryData(["challengeEntries", challenge.id], ctx.prevEntries);
      if (ctx?.prevVotes) queryClient.setQueryData(["myVotes", challenge.id, user?.email], ctx.prevVotes);
      toast.error("Failed to register vote");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challengeEntries"] });
      queryClient.invalidateQueries({ queryKey: ["myVotes"] });
    },
  });

  const sortedEntries = [...entries].sort((a, b) => {
    if (challenge.status === "completed" && a.rank && b.rank) {
      return a.rank - b.rank;
    }
    return (b.vote_count || 0) - (a.vote_count || 0);
  });

  const hasVoted = (entryId) => myVotes.some(v => v.entry_id === entryId);
  const canVote = challenge.status === "voting" && user;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {challenge.title} - Leaderboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5">
                  <Skeleton className="w-12 h-12 rounded-lg bg-white/5" />
                  <Skeleton className="w-24 h-24 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-1/3 bg-white/5" />
                    <Skeleton className="h-3 w-1/4 bg-white/5" />
                    <Skeleton className="h-3 w-2/3 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card className="bg-white/[0.02] border-white/5 p-8 text-center">
              <p className="text-white/40">No entries yet. Be the first!</p>
            </Card>
          ) : (
            sortedEntries.map((entry, idx) => {
              const voted = hasVoted(entry.id);
              const isWinner = challenge.status === "completed" && idx === 0;
              
              return (
                <Card 
                  key={entry.id} 
                  className={`bg-white/[0.02] border-white/5 p-4 ${
                    isWinner ? "border-amber-500/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center">
                      {isWinner ? (
                        <Trophy className="w-8 h-8 text-amber-500" />
                      ) : (
                        <div className="text-2xl font-bold text-white/60">#{idx + 1}</div>
                      )}
                    </div>

                    {/* Photo */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {entry.photos?.[0] ? (
                        <img src={entry.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-white font-medium">{entry.strain_name}</h4>
                          <p className="text-white/40 text-sm">by {entry.user_name}</p>
                        </div>
                        {isWinner && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                            Winner 🏆
                          </Badge>
                        )}
                      </div>
                      
                      {entry.description && (
                        <p className="text-white/60 text-sm line-clamp-2 mb-2">{entry.description}</p>
                      )}

                      <div className="flex items-center gap-4">
                        {canVote && entry.user_email !== user.email && (
                          <Button
                            size="sm"
                            variant={voted ? "default" : "outline"}
                            onClick={() => voteMutation.mutate(entry.id)}
                            className={voted ? "bg-pink-600 hover:bg-pink-500" : "border-white/10 text-white hover:bg-white/5"}
                          >
                            <Heart className={`w-3.5 h-3.5 mr-1 ${voted ? "fill-white" : ""}`} />
                            {entry.vote_count || 0}
                          </Button>
                        )}

                        {!canVote && (
                          <div className="flex items-center gap-1.5 text-white/60">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="text-sm">{entry.vote_count || 0} votes</span>
                          </div>
                        )}

                        {entry.metrics?.yield && (
                          <div className="text-xs text-white/50">
                            {entry.metrics.yield}g yield
                          </div>
                        )}
                        {entry.metrics?.days && (
                          <div className="text-xs text-white/50">
                            {entry.metrics.days} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {canVote && (
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-300 text-sm">
              ❤️ Vote for your favorite entries! You can change your vote anytime before voting closes.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}