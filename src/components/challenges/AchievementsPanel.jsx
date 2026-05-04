import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star } from "lucide-react";
import { format } from "date-fns";

const medalEmoji = { gold: "🥇", silver: "🥈", bronze: "🥉", participation: "🎖️" };
const medalColors = {
  gold: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
  silver: "from-slate-400/20 to-slate-500/10 border-slate-400/30",
  bronze: "from-orange-600/20 to-amber-700/10 border-orange-500/30",
  participation: "from-white/5 to-white/[0.02] border-white/10",
};

export default function AchievementsPanel({ userEmail }) {
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["challenges", "achievements", userEmail],
    queryFn: () => base44.entities.UserAchievement.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    staleTime: 60_000,
  });

  const gold = achievements.filter(a => a.medal === "gold").length;
  const silver = achievements.filter(a => a.medal === "silver").length;
  const bronze = achievements.filter(a => a.medal === "bronze").length;
  const participation = achievements.filter(a => a.medal === "participation").length;

  if (isLoading) return <div className="text-white/30 text-sm p-8 text-center">Loading achievements...</div>;

  return (
    <div className="space-y-6">
      {/* Medal summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Gold", count: gold, emoji: "🥇", color: "text-amber-400" },
          { label: "Silver", count: silver, emoji: "🥈", color: "text-slate-300" },
          { label: "Bronze", count: bronze, emoji: "🥉", color: "text-orange-400" },
          { label: "Participation", count: participation, emoji: "🎖️", color: "text-white/60" },
        ].map(({ label, count, emoji, color }) => (
          <Card key={label} className="bg-white/[0.02] border-white/5 p-3 text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className={`text-xl font-bold ${color}`}>{count}</div>
            <div className="text-white/30 text-xs">{label}</div>
          </Card>
        ))}
      </div>

      {achievements.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/5 p-12 text-center">
          <Award className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No achievements yet.</p>
          <p className="text-white/20 text-xs mt-1">Enter challenges to earn badges and medals!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements
            .sort((a, b) => {
              const order = { gold: 0, silver: 1, bronze: 2, participation: 3 };
              return (order[a.medal] ?? 4) - (order[b.medal] ?? 4);
            })
            .map(achievement => (
              <Card key={achievement.id}
                className={`bg-gradient-to-br border p-4 ${medalColors[achievement.medal] || medalColors.participation}`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{medalEmoji[achievement.medal]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-medium text-sm">{achievement.badge_name}</span>
                      {achievement.skill_level && achievement.skill_level !== "all" && (
                        <Badge className="text-xs bg-white/10 text-white/60 border-0 capitalize">{achievement.skill_level}</Badge>
                      )}
                    </div>
                    <p className="text-white/50 text-xs line-clamp-1">{achievement.challenge_title}</p>
                    {achievement.cadence && (
                      <p className="text-white/30 text-xs capitalize mt-0.5">{achievement.cadence.replace("_", " ")} challenge</p>
                    )}
                    {achievement.earned_date && (
                      <p className="text-white/20 text-xs mt-1">{format(new Date(achievement.earned_date), "MMM d, yyyy")}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}