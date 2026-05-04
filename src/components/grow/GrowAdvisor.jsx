import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Thermometer, Droplets, Leaf, FlaskConical,
  AlertTriangle, ChevronDown, ChevronUp, Zap, ArrowRight, LoaderCircle
} from "lucide-react";

const sectionIcons = {
  environment: Thermometer,
  roots: Leaf,
  nutrients: FlaskConical,
  watering: Droplets,
  plant_health: Sparkles,
};

const sectionColors = {
  environment: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  roots: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  nutrients: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  watering: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  plant_health: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const stageColors = {
  germination: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  vegetative: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  flowering: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  harvest: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function ScoreRing({ score }) {
  const color = score >= 8 ? "#22c55e" : score >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${(score / 10) * 163.4} 163.4`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{score}</span>
      </div>
      <span className="text-white/40 text-xs">Health</span>
    </div>
  );
}

function RecommendationSection({ sectionKey, section }) {
  const [open, setOpen] = useState(true);
  const Icon = sectionIcons[sectionKey] || Leaf;
  const colorClass = sectionColors[sectionKey] || "text-white/60 bg-white/5 border-white/10";

  return (
    <div className={`rounded-xl border ${colorClass} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{section.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
      </button>
      {open && (
        <ul className="px-4 pb-4 space-y-2">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
              <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GrowAdvisor({ strainId, strainName }) {
  const [advice, setAdvice] = useState(null);
  const [stage, setStage] = useState(null);
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("growAdvisor", { strainId });
      setAdvice(res.data.advice);
      setStage(res.data.stage);
      setWeek(res.data.week);
    } catch (e) {
      setError("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sectionOrder = ["environment", "roots", "nutrients", "watering", "plant_health"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h3 className="text-white font-medium">AI Grow Advisor</h3>
        </div>
        <Button
          onClick={fetchAdvice}
          disabled={loading}
          size="sm"
          className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
        >
          {loading ? (
            <><LoaderCircle className="w-4 h-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {advice ? "Refresh" : "Analyze"}</>
          )}
        </Button>
      </div>

      {!advice && !loading && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Sparkles className="w-10 h-10 text-violet-400/40 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            Click <strong className="text-white/60">Analyze</strong> to get AI-powered weekly recommendations
            tailored to your strain's current stage, environment, nutrients, and watering data.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {advice && (
        <div className="space-y-4">
          {/* Stage + Health Overview */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-start gap-4">
              <ScoreRing score={advice.health_score || 7} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`border text-xs capitalize ${stageColors[stage] || "bg-white/10 text-white border-white/10"}`}>
                    {stage} — Week {week}
                  </Badge>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{advice.stage_summary}</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {advice.alerts?.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" /> Alerts
              </div>
              {advice.alerts.map((alert, i) => (
                <p key={i} className="text-amber-300/80 text-sm pl-6">{alert}</p>
              ))}
            </div>
          )}

          {/* Recommendation Sections */}
          <div className="space-y-3">
            {sectionOrder.map((key) =>
              advice.recommendations?.[key] ? (
                <RecommendationSection key={key} sectionKey={key} section={advice.recommendations[key]} />
              ) : null
            )}
          </div>

          {/* Next Week + Pro Tip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium mb-2">
                <ArrowRight className="w-3.5 h-3.5" /> Next Week Preview
              </div>
              <p className="text-white/70 text-sm">{advice.next_week_preview}</p>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-medium mb-2">
                <Zap className="w-3.5 h-3.5" /> Pro Tip
              </div>
              <p className="text-violet-300/80 text-sm">{advice.pro_tip}</p>
            </div>
          </div>

          <p className="text-white/20 text-xs text-center">
            AI analysis uses {strainName}'s environmental readings, nutrient logs, and watering data
          </p>
        </div>
      )}
    </div>
  );
}