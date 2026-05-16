import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart2, Droplets, Trophy, MessageSquare, BookOpen, Crown, ArrowRight, Sparkles } from "lucide-react";

const features = [
  { icon: Leaf, title: "Strain Tracking", desc: "Track every grow from seed to harvest with detailed logs." },
  { icon: BarChart2, title: "Analytics", desc: "Visualize temperature, humidity, VPD, EC and pH trends." },
  { icon: Droplets, title: "Watering & Nutrients", desc: "Schedule waterings and log every nutrient application." },
  { icon: Trophy, title: "Challenges", desc: "Compete in community grow challenges and earn badges." },
  { icon: MessageSquare, title: "Community Chat", desc: "Connect with growers and share tips in real-time." },
  { icon: BookOpen, title: "Learn", desc: "Guides on deficiencies, training, and best practices." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mb-2">
          <Leaf className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight">
          Dank Blossom
        </h1>
        <p className="text-white/50 text-lg md:text-xl max-w-xl">
          The ultimate grow journal for tracking, optimizing, and mastering your cannabis cultivation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link to="/Dashboard">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 px-6 py-5 text-base">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/Premium">
            <Button variant="outline" className="border-white/10 text-white/70 hover:bg-white/5 gap-2 px-6 py-5 text-base">
              <Crown className="w-4 h-4 text-amber-400" /> Upgrade to Premium
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-white/30 text-sm uppercase tracking-widest mb-10">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-medium">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 px-6 py-16 text-center flex flex-col items-center gap-4">
        <Sparkles className="w-6 h-6 text-emerald-400" />
        <h2 className="text-2xl font-light">Ready to grow smarter?</h2>
        <p className="text-white/40 text-sm max-w-sm">Jump into your dashboard and start logging your first strain.</p>
        <Link to="/Dashboard">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 mt-2">
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}