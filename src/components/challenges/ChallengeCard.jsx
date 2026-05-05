import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const challengeEmoji = {
  biggest_flower: "🌸", fastest_veg: "⚡", highest_yield: "📊",
  best_deficiency_recovery: "💚", most_trichomes: "💎", best_training: "🎓",
  best_roots: "🌱", vpd_mastery: "🌡️", nutrient_precision: "🧪",
  first_harvest: "🌿", ph_perfectionist: "⚗️", biggest_node_spacing: "📏",
  best_lollipop: "🍭", pest_recovery: "🛡️", best_autoflower: "⚡",
  consistency_king: "👑", biggest_cola: "🏆", fastest_flower: "🔥",
  best_journal: "📓", flush_master: "💧",
};

const skillColors = {
  beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  all: "bg-white/10 text-white/60 border-white/20",
};

const cadenceColors = {
  weekly: "bg-sky-500/20 text-sky-300",
  monthly: "bg-violet-500/20 text-violet-300",
  per_harvest: "bg-amber-500/20 text-amber-300",
};

const cadenceLabel = { weekly: "Weekly", monthly: "Monthly", per_harvest: "Per Harvest" };

export default function ChallengeCard({ challenge, userEntry, onSubmit, onViewLeaderboard, votingMode, completed }) {
  const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
  const hasEntered = !!userEntry;

  return (
    <Card className="bg-white/[0.02] border-white/5 overflow-hidden hover:border-emerald-500/20 transition-all hover:bg-white/[0.04]">
      {/* Banner */}
      <div className="h-28 bg-gradient-to-br from-emerald-900/40 to-zinc-900 relative overflow-hidden">
        {challenge.image_url ? (
          <img src={challenge.image_url} alt={challenge.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl">{challengeEmoji[challenge.type] || "🏆"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        {/* Badges top row */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {challenge.cadence && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cadenceColors[challenge.cadence]}`}>
                {cadenceLabel[challenge.cadence]}
              </span>
            )}
            {challenge.skill_level && challenge.skill_level !== "all" && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${skillColors[challenge.skill_level]}`}>
                {challenge.skill_level}
              </span>
            )}
          </div>
          <div>
            {challenge.status === "active" && <Badge className="bg-emerald-600 text-white border-0 text-xs">Active</Badge>}
            {challenge.status === "voting" && <Badge className="bg-purple-600 text-white border-0 text-xs">Voting</Badge>}
            {challenge.status === "completed" && <Badge className="bg-amber-600 text-white border-0 text-xs">Done</Badge>}
            {challenge.status === "upcoming" && <Badge className="bg-zinc-600 text-white border-0 text-xs">Soon</Badge>}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-base leading-tight mb-1">{challenge.title}</h3>
          <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">{challenge.description}</p>
        </div>

        {/* Medals row */}
        {(challenge.medal_gold || challenge.prize_badge) && (
          <div className="flex items-center gap-2 flex-wrap">
            {challenge.medal_gold && <span className="text-xs text-amber-300">🥇 {challenge.medal_gold}</span>}
            {challenge.medal_silver && <span className="text-xs text-slate-300">🥈 {challenge.medal_silver}</span>}
            {challenge.medal_bronze && <span className="text-xs text-orange-400">🥉 {challenge.medal_bronze}</span>}
          </div>
        )}

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs text-white/40">
          <div className="flex items-center gap-1">
            {challenge.status === "active" ? (
              <><Clock className="w-3 h-3" /> <span>{daysLeft > 0 ? `${daysLeft}d left` : "Ending today"}</span></>
            ) : (
              <><Calendar className="w-3 h-3" /> <span>{format(new Date(challenge.end_date), "MMM d")}</span></>
            )}
          </div>
          {challenge.prize_badge && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400/80">{challenge.prize_badge}</span>
            </div>
          )}
        </div>

        {hasEntered && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>You've entered!</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {challenge.status === "active" && !hasEntered && (
            <Button onClick={onSubmit} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-sm h-9">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Enter
            </Button>
          )}
          <Button variant="outline" onClick={onViewLeaderboard} size="sm"
            className="flex-1 border-white/10 text-white hover:bg-white/5 text-sm h-9">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            {votingMode ? "Vote" : "Leaderboard"}
          </Button>
        </div>
      </div>
    </Card>
  );
}