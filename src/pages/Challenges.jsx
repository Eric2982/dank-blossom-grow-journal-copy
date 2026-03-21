import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, TrendingUp, Award, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ChallengeCard from "../components/challenges/ChallengeCard";
import EntrySubmitDialog from "../components/challenges/EntrySubmitDialog";
import LeaderboardDialog from "../components/challenges/LeaderboardDialog";
import ChallengesInfoDialog from "../components/challenges/ChallengesInfoDialog";
import PullToRefresh from "../components/PullToRefresh";

export default function Challenges() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-start_date"),
  });

  const { data: myEntries = [] } = useQuery({
    queryKey: ["myEntries", user?.email],
    queryFn: () => base44.entities.ChallengeEntry.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["challenges"] }),
      queryClient.invalidateQueries({ queryKey: ["myEntries"] }),
    ]);
  };

  const activeChallenges = challenges.filter(c => c.status === "active");
  const votingChallenges = challenges.filter(c => c.status === "voting");
  const completedChallenges = challenges.filter(c => c.status === "completed");

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" /> Community Challenges
            </h1>
            <p className="text-white/40 text-sm mt-1">Compete with growers worldwide</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowInfoDialog(true)}
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 gap-2">
            <HelpCircle className="w-4 h-4" /> How it works
          </Button>
        </div>

        {user?.badges?.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-white/80 text-sm font-medium">Your Badges:</span>
              {user.badges.map((badge, idx) => (
                <Badge key={idx} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">🏆 {badge}</Badge>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-white/[0.02] border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
              <div><div className="text-2xl font-semibold text-white">{activeChallenges.length}</div><div className="text-white/40 text-xs">Active</div></div>
            </div>
          </Card>
          <Card className="bg-white/[0.02] border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div>
              <div><div className="text-2xl font-semibold text-white">{myEntries.length}</div><div className="text-white/40 text-xs">My Entries</div></div>
            </div>
          </Card>
          <Card className="bg-white/[0.02] border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Calendar className="w-5 h-5 text-purple-400" /></div>
              <div><div className="text-2xl font-semibold text-white">{votingChallenges.length}</div><div className="text-white/40 text-xs">Voting</div></div>
            </div>
          </Card>
          <Card className="bg-white/[0.02] border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center"><Trophy className="w-5 h-5 text-amber-400" /></div>
              <div><div className="text-2xl font-semibold text-white">{user?.badges?.length || 0}</div><div className="text-white/40 text-xs">Badges</div></div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="active" className="data-[state=active]:bg-emerald-600">Active ({activeChallenges.length})</TabsTrigger>
            <TabsTrigger value="voting" className="data-[state=active]:bg-purple-600">Voting ({votingChallenges.length})</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white/10">Completed ({completedChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeChallenges.length === 0 ? (
              <Card className="bg-white/[0.02] border-white/5 p-12 text-center">
                <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No active challenges at the moment</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge}
                    userEntry={myEntries.find(e => e.challenge_id === challenge.id)}
                    onSubmit={() => { setSelectedChallenge(challenge); setShowSubmitDialog(true); }}
                    onViewLeaderboard={() => { setSelectedChallenge(challenge); setShowLeaderboard(true); }} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="voting" className="space-y-4 mt-6">
            {votingChallenges.length === 0 ? (
              <Card className="bg-white/[0.02] border-white/5 p-12 text-center">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No challenges in voting phase</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {votingChallenges.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge}
                    userEntry={myEntries.find(e => e.challenge_id === challenge.id)}
                    onViewLeaderboard={() => { setSelectedChallenge(challenge); setShowLeaderboard(true); }}
                    votingMode />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedChallenges.length === 0 ? (
              <Card className="bg-white/[0.02] border-white/5 p-12 text-center">
                <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No completed challenges yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedChallenges.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge}
                    userEntry={myEntries.find(e => e.challenge_id === challenge.id)}
                    onViewLeaderboard={() => { setSelectedChallenge(challenge); setShowLeaderboard(true); }}
                    completed />
                ))}
              </div>
            )}
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