import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, TrendingUp, CheckCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const challengeIcons = {
  biggest_flower: "🌸",
  fastest_veg: "⚡",
  highest_yield: "📊",
  best_deficiency_recovery: "💚",
  most_trichomes: "💎",
  best_training: "🎓",
};

export default function ChallengeCard({ challenge, userEntry, onSubmit, onViewLeaderboard, votingMode, completed }) {
  const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
  const hasEntered = !!userEntry;

  return (
    <Card className="bg-white/[0.02] border-white/5 overflow-hidden hover:border-emerald-500/30 transition-colors">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-emerald-900/30 to-green-900/30 relative overflow-hidden">
        {challenge.image_url ? (
          <img src={challenge.image_url} alt={challenge.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">{challengeIcons[challenge.type] || "🏆"}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          {challenge.status === "active" && (
            <Badge className="bg-emerald-600 text-white border-0">Active</Badge>
          )}
          {challenge.status === "voting" && (
            <Badge className="bg-purple-600 text-white border-0">Voting Open</Badge>
          )}
          {challenge.status === "completed" && (
            <Badge className="bg-amber-600 text-white border-0">Completed</Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">{challenge.title}</h3>
          <p className="text-white/60 text-sm line-clamp-2">{challenge.description}</p>
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-xs text-white/50">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {challenge.status === "active" ? (
              <span>{daysLeft}d left</span>
            ) : (
              <span>Ended {format(new Date(challenge.end_date), "MMM d")}</span>
            )}
          </div>
          {challenge.prize_badge && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{challenge.prize_badge}</span>
            </div>
          )}
        </div>

        {/* User Entry Status */}
        {hasEntered && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>You've entered this challenge!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {challenge.status === "active" && !hasEntered && (
            <Button
              onClick={onSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Enter Challenge
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onViewLeaderboard}
            className="flex-1 border-white/10 text-white hover:bg-white/5"
          >
            <Users className="w-4 h-4 mr-2" />
            {votingMode ? "Vote" : "Leaderboard"}
          </Button>
        </div>
      </div>
    </Card>
  );
}