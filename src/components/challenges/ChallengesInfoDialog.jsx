import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Star, Zap } from "lucide-react";

const challengeTypes = [
  { type: "biggest_flower", icon: "🌸", name: "Biggest Flower", desc: "Submit photos of your largest, most impressive flowers. Judged by size, density, and overall appearance.", level: "All Levels" },
  { type: "fastest_veg", icon: "⚡", name: "Fastest Veg", desc: "Who can achieve the fastest vegetative growth? Track and submit days from seed to flip.", level: "Basic+" },
  { type: "highest_yield", icon: "⚖️", name: "Highest Yield", desc: "Submit your harvest weights. Judged by grams per watt or total yield for your grow size.", level: "Advanced" },
  { type: "best_deficiency_recovery", icon: "💊", name: "Best Recovery", desc: "Show your plant's journey from deficiency to full recovery. Best before/after transformation wins.", level: "All Levels" },
  { type: "most_trichomes", icon: "🔬", name: "Most Trichomes", desc: "Showcase the frostiest, most resin-coated buds. Close-up macro photography encouraged.", level: "Advanced" },
  { type: "best_training", icon: "🌿", name: "Best Training", desc: "Show off your LST, SCROG, topping, or manifolding skills. Judged on technique and results.", level: "Basic+" },
];

const badges = [
  { name: "🏆 Champion", color: "bg-amber-500/20 text-amber-400", desc: "1st place in any challenge" },
  { name: "🥈 Runner Up", color: "bg-zinc-400/20 text-zinc-300", desc: "2nd place finish" },
  { name: "🥉 Bronze Grower", color: "bg-orange-700/20 text-orange-400", desc: "3rd place finish" },
  { name: "🌟 Community Star", color: "bg-blue-500/20 text-blue-400", desc: "Earn the most community votes" },
  { name: "🌱 First Entry", color: "bg-emerald-500/20 text-emerald-400", desc: "Submit your first challenge entry" },
  { name: "🔥 Streak Grower", color: "bg-red-500/20 text-red-400", desc: "Enter 3 consecutive challenges" },
];

export default function ChallengesInfoDialog({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            How Community Challenges Work
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-emerald-600">Overview</TabsTrigger>
            <TabsTrigger value="process" className="text-xs data-[state=active]:bg-emerald-600">Process</TabsTrigger>
            <TabsTrigger value="types" className="text-xs data-[state=active]:bg-emerald-600">Types</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs data-[state=active]:bg-emerald-600">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4 text-sm">
            <div className="rounded-xl bg-white/5 p-4">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> What are Community Challenges?</h3>
              <p className="text-white/60 leading-relaxed">
                Community Challenges are monthly growing competitions where growers of all skill levels compete to showcase their best grows. Whether you're a first-time grower or a seasoned expert, there's a challenge for you. Show off your skills, learn from others, and earn exclusive badges.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Who Can Participate?</h3>
              <p className="text-white/60 leading-relaxed">
                All registered Dank Blossom users can participate. Challenges are designed for different skill levels — novice, basic, advanced, and all-level — so everyone has a fair shot at winning.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Purpose</h3>
              <p className="text-white/60 leading-relaxed">
                Challenges are designed to motivate growers to document their grows, push their skills further, build community connections, and celebrate cultivation excellence at every level.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="process" className="mt-4 space-y-3 text-sm">
            {[
              { step: "1", title: "Challenge Opens", desc: "A new challenge goes live with a specific theme and rules. The challenge remains active for a set period (usually 2-4 weeks).", color: "bg-emerald-600" },
              { step: "2", title: "Submit Your Entry", desc: "Click 'Enter Challenge' on any active challenge. Select one of your tracked strains, add photos, describe your grow, and include relevant metrics (yield, days, etc.).", color: "bg-blue-600" },
              { step: "3", title: "Community Voting", desc: "After the submission period ends, the challenge enters 'Voting' phase. All community members can view and vote for their favorite entries. You cannot vote for your own entry.", color: "bg-purple-600" },
              { step: "4", title: "AI Scoring", desc: "An AI system evaluates entries based on photo quality, described metrics, and challenge criteria to generate an objective quality score alongside community votes.", color: "bg-orange-600" },
              { step: "5", title: "Winners Announced", desc: "Top entries by combined community votes and AI score are ranked. Winners receive exclusive badges added to their profile and are featured in the completed challenges leaderboard.", color: "bg-amber-600" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center shrink-0 text-white text-xs font-bold mt-0.5`}>{step}</div>
                <div>
                  <h4 className="text-white font-medium">{title}</h4>
                  <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="types" className="mt-4 space-y-3 text-sm">
            {challengeTypes.map(c => (
              <div key={c.type} className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium">{c.icon} {c.name}</h4>
                  <Badge className="bg-white/10 text-white/60 border-0 text-[10px]">{c.level}</Badge>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="mt-4 space-y-3 text-sm">
            <p className="text-white/60">Earn badges by winning or participating in challenges. Badges appear on your profile.</p>
            {badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <Badge className={`${badge.color} border-0 text-sm`}>{badge.name}</Badge>
                <p className="text-white/60 text-xs">{badge.desc}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}