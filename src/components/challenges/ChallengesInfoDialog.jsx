import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";

const skillInfo = [
  { level: "Beginner", emoji: "🌱", color: "text-emerald-400", desc: "Perfect for first-time or early growers. Focused on fundamentals like pH, VPD, consistency, and your first harvest." },
  { level: "Intermediate", emoji: "🌿", color: "text-blue-400", desc: "For growers who've completed a few harvests. Topics include training, canopy management, deficiency recovery, and root health." },
  { level: "Advanced", emoji: "🏆", color: "text-purple-400", desc: "For experienced growers pushing limits. Precision nutrient science, lollipop mastery, biggest cola, and data-driven growing." },
  { level: "All Levels", emoji: "⭐", color: "text-amber-400", desc: "Open to everyone. These challenges celebrate milestones like best autoflower, best harvest journal, and community favourites." },
];

const cadenceInfo = [
  { label: "Weekly", emoji: "⚡", color: "text-sky-400", desc: "Short 7-day sprints focused on discipline \u2014 daily logging, pH consistency, VPD streaks. Fast rewards for daily growers." },
  { label: "Monthly", emoji: "📅", color: "text-violet-400", desc: "Month-long competitions with room to show technique, training progression, and results over a full grow phase." },
  { label: "Per Harvest", emoji: "🌿", color: "text-amber-400", desc: "Submit at any point once your harvest is done. Perfect for milestone challenges like First Harvest, Best Autoflower, or Biggest Cola." },
];

const medals = [
  { emoji: "🥇", label: "Gold", color: "text-amber-400", desc: "1st place \u2014 the top voted + best documented entry wins the Gold badge for that challenge." },
  { emoji: "🥈", label: "Silver", color: "text-slate-300", desc: "2nd place \u2014 earns the Silver badge and is featured in the leaderboard permanently." },
  { emoji: "🥉", label: "Bronze", color: "text-orange-400", desc: "3rd place \u2014 earns the Bronze badge." },
  { emoji: "🎖️", label: "Participation", color: "text-white/60", desc: "Every valid entry earns a Participation badge, no matter the result. Consistency builds skill." },
];

export default function ChallengesInfoDialog({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            How Challenges Work
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-emerald-600">Overview</TabsTrigger>
            <TabsTrigger value="levels" className="text-xs data-[state=active]:bg-emerald-600">Levels</TabsTrigger>
            <TabsTrigger value="cadence" className="text-xs data-[state=active]:bg-emerald-600">Cadence</TabsTrigger>
            <TabsTrigger value="medals" className="text-xs data-[state=active]:bg-emerald-600">Medals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-3 text-sm">
            {[
              { step: "1", title: "Find a Challenge", desc: "Browse Active challenges filtered by skill level (Beginner → Advanced) and cadence (Weekly, Monthly, Per Harvest). Pick one that fits where you are in your grow.", color: "bg-emerald-600" },
              { step: "2", title: "Submit Your Entry", desc: "Click Enter Challenge. Select a tracked strain, upload photos documenting your grow, describe your process, and add any relevant metrics (yield, days, EC, etc.).", color: "bg-blue-600" },
              { step: "3", title: "Community Voting", desc: "Once submissions close, the challenge enters Voting. All community members can vote for their favourite entry. You cannot vote for yourself.", color: "bg-purple-600" },
              { step: "4", title: "Winners & Medals", desc: "Top 3 entries receive Gold, Silver, and Bronze medals added to their Achievements profile. Every valid submission earns a Participation badge.", color: "bg-amber-600" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center shrink-0 text-white text-xs font-bold mt-0.5`}>{step}</div>
                <div>
                  <h4 className="text-white font-medium text-sm">{title}</h4>
                  <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="levels" className="mt-4 space-y-3">
            {skillInfo.map(({ level, emoji, color, desc }) => (
              <div key={level} className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{emoji}</span>
                  <h4 className={`font-medium ${color}`}>{level}</h4>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="cadence" className="mt-4 space-y-3">
            {cadenceInfo.map(({ label, emoji, color, desc }) => (
              <div key={label} className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{emoji}</span>
                  <h4 className={`font-medium ${color}`}>{label}</h4>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="medals" className="mt-4 space-y-3">
            <p className="text-white/40 text-xs">All medals are stored in your Achievements tab and never expire.</p>
            {medals.map(({ emoji, label, color, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className={`font-medium text-sm ${color}`}>{label}</p>
                  <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}