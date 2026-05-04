import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, TrendingUp, Award, HelpCircle, Star, Zap, Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ChallengeCard from "../components/challenges/ChallengeCard";
import EntrySubmitDialog from "../components/challenges/EntrySubmitDialog";
import LeaderboardDialog from "../components/challenges/LeaderboardDialog";
import ChallengesInfoDialog from "../components/challenges/ChallengesInfoDialog";
import AchievementsPanel from "../components/challenges/AchievementsPanel";
import PullToRefresh from "../components/PullToRefresh";

const cadenceTabs = [
  { value: "all", label: "All", icon: Trophy },
  { value: "weekly", label: "Weekly", icon: Zap },
  { value: "monthly", label: "Monthly", icon: Calendar },
  { value: "per_harvest", label: "Harvest", icon: Leaf },
];

const skillLevels = ["all", "beginner", "intermediate", "advanced"];

export default function Challenges() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [cadenceFilter, setCadenceFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("active");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["challenges", "user"],
    queryFn: () => base44.auth.me(),
    staleTime: 300_000,
  });

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges", "list"],
    queryFn: () => base44.entities.Challenge.list("-start_date"),
    staleTime: 60_000,
  });

  const { data: myEntries = [] } = useQuery({
    queryKey: ["challenges", "myEntries", user?.email],
    queryFn: () => base44.entities.ChallengeEntry.filter({ user_email: user.email }),
    enabled: !!user?.email,
    staleTime: 30_000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["challenges"] });
  };

  // Filter logic
  const filtered = challenges.filter(c => {
    const byStatus = statusTab === "active" ? c.status === "active"
      : statusTab === "voting" ? c.status === "voting"
      : statusTab === "completed" ? c.status === "completed"
      : true;
    const byCadence = cadenceFilter === "all" || c.cadence === cadenceFilter;
    const bySkill = skillFilter === "all" || c.skill_level === skillFilter || c.skill_level === "all";
    return byStatus && byCadence && bySkill;
  });

  const activeChallenges = challenges.filter(c => c.status === "active");
  const votingChallenges = challenges.filter(c => c.status === "voting");
  const completedChallenges = challenges.filter(c => c.status === "completed");

  if (isLoading) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48 bg-white/5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)}
      </div>
    </div>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" /> Challenges
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Earn badges & medals — beginner to advanced</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowInfoDialog(true)}
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 gap-2">
            <HelpCircle className="w-4 h-4" /> How it works
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/20", val: activeChallenges.length, label: "Active" },
            { icon: Users, color: "text-blue-400 bg-blue-500/20", val: myEntries.length, label: "My Entries" },
            { icon: Calendar, color: "text-purple-400 bg-purple-500/20", val: votingChallenges.length, label: "Voting" },
            { icon: Award, color: "text-amber-400 bg-amber-500/20", val: completedChallenges.length, label: "Completed" },
          ].map(({ icon: Icon, color, val, label }) => (
            <Card key={label} className="bg-white/[0.02] border-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-white">{val}</div>
                  <div className="text-white/40 text-xs">{label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main tabs: Challenges vs Achievements */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="challenges" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2">
              <Trophy className="w-4 h-4" /> Challenges
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white gap-2">
              <Star className="w-4 h-4" /> My Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-5">
            {/* Status sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { val: "active", label: `Active (${activeChallenges.length})` },
                { val: "voting", label: `Voting (${votingChallenges.length})` },
                { val: "completed", label: `Completed (${completedChallenges.length})` },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => setStatusTab(val)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusTab === val
                      ? val === "active" ? "bg-emerald-600 text-white"
                      : val === "voting" ? "bg-purple-600 text-white"
                      : "bg-amber-600 text-white"
                      : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Cadence filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/30 text-xs">Cadence:</span>
              {cadenceTabs.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setCadenceFilter(value)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                    cadenceFilter === value ? "bg-white/20 text-white" : "bg-white/5 text-white/40 hover:text-white"
                  }`}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>

            {/* Skill filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/30 text-xs">Skill:</span>
              {skillLevels.map(level => (
                <button key={level} onClick={() => setSkillFilter(level)}
                  className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                    skillFilter === level ? "bg-white/20 text-white" : "bg-white/5 text-white/40 hover:text-white"
                  }`}>
                  {level === "all" ? "All Levels" : level}
                </button>
              ))}
            </div>

            {/* Challenge grid */}
            {filtered.length === 0 ? (
              <Card className="bg-white/[0.02] border-white/5 p-12 text-center">
                <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">No challenges match your filters</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userEntry={myEntries.find(e => e.challenge_id === challenge.id)}
                    onSubmit={() => { setSelectedChallenge(challenge); setShowSubmitDialog(true); }}
                    onViewLeaderboard={() => { setSelectedChallenge(challenge); setShowLeaderboard(true); }}
                    votingMode={challenge.status === "voting"}
                    completed={challenge.status === "completed"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsPanel userEmail={user?.email} />
          </TabsContent>
        </Tabs>

        {showSubmitDialog && selectedChallenge && (
          <EntrySubmitDialog challenge={selectedChallenge} open={showSubmitDialog}
            onClose={() => { setShowSubmitDialog(false); setSelectedChallenge(null); }} />
        )}
        {showLeaderboard && selectedChallenge && (
          <LeaderboardDialog challenge={selectedChallenge} open={showLeaderboard}
            onClose={() => { setShowLeaderboard(false); setSelectedChallenge(null); }} />
        )}
        <ChallengesInfoDialog open={showInfoDialog} onClose={() => setShowInfoDialog(false)} />
      </div>
    </PullToRefresh>
  );
}