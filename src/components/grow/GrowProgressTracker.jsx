import React, { useState } from "react";
import { differenceInDays } from "date-fns";
import { Sprout, Flower2, Leaf, Scissors, ChevronDown, ChevronUp } from "lucide-react";

const STAGES = {
  germination: {
    icon: Sprout,
    color: "text-lime-400",
    bg: "bg-lime-400/10",
    border: "border-lime-400/20",
    label: "Germination",
    weeks: [
      {
        week: 1,
        title: "Germination & Seedling",
        tips: [
          "Seeds crack and taproot emerges",
          "Keep humidity at 70–80%, temp 75–80°F",
          "Provide 18+ hours of gentle light (100–200 µmol)",
          "Cotyledons (seed leaves) unfurl",
          "No nutrients needed — seed has its own supply",
        ],
      },
    ],
  },
  vegetative: {
    icon: Leaf,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    label: "Vegetative",
    weeks: [
      {
        week: 1,
        title: "Early Veg",
        tips: [
          "First true leaves appear",
          "Begin very light feeding (EC 0.4–0.8)",
          "18/6 light schedule recommended",
          "Maintain humidity 60–70%, temp 70–80°F",
          "Focus on root development",
        ],
      },
      {
        week: 2,
        title: "Rooting & Establishment",
        tips: [
          "Root system expanding rapidly",
          "Increase feeding gradually (EC 0.8–1.2)",
          "Plant is establishing its structure",
          "Watch for any early deficiencies",
          "Begin LST if desired",
        ],
      },
      {
        week: 3,
        title: "Vigorous Growth",
        tips: [
          "Explosive leaf & node development",
          "Increase feeding to EC 1.2–1.6",
          "Begin topping or training techniques",
          "Canopy management is key now",
          "VPD target: 1.0–1.2 kPa",
        ],
      },
      {
        week: 4,
        title: "Mid Veg — Canopy Filling",
        tips: [
          "Plant is building bulk and structure",
          "EC 1.4–1.8 with high N ratio (3-1-2)",
          "SCROG net should be in place if using",
          "Defoliate lightly to improve airflow",
          "Aim for even canopy height",
        ],
      },
      {
        week: 5,
        title: "Late Veg — Pre-Flip Prep",
        tips: [
          "Final shaping before flip to flower",
          "Reduce nitrogen slightly",
          "Ensure all training is done — 1 week before flip",
          "Plant may double in size during stretch",
          "EC 1.6–2.0",
        ],
      },
      {
        week: 6,
        title: "Transition Ready",
        tips: [
          "Ready to flip to 12/12 lighting",
          "Final heavy defoliation optional",
          "Plant is mature and strong",
          "Prepare bloom nutrients",
          "Monitor for any root-bound signs",
        ],
      },
    ],
  },
  flowering: {
    icon: Flower2,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    label: "Flowering",
    weeks: [
      {
        week: 1,
        title: "Flip — Transition Week",
        tips: [
          "Switch to 12/12 light schedule",
          "Begin bloom nutrients (1-2-2 ratio)",
          "Expect growth stretch to begin",
          "EC 1.4–1.8",
          "Maintain humidity below 55%",
        ],
      },
      {
        week: 2,
        title: "Stretch Begins",
        tips: [
          "Pre-flowers appear — sex is visible",
          "Plant may grow 25–50% taller this week",
          "Continue light defoliation as needed",
          "EC 1.6–2.0",
          "VPD target: 1.0–1.5 kPa",
        ],
      },
      {
        week: 3,
        title: "Stretch Continues — Bud Sites Form",
        tips: [
          "White pistils forming at all bud sites",
          "Defoliate heavily on Day 21 (optional)",
          "Increase P & K — reduce N",
          "EC 1.8–2.2",
          "Temp: 68–78°F, Humidity: 45–50%",
        ],
      },
      {
        week: 4,
        title: "Bud Development",
        tips: [
          "Buds stacking and swelling rapidly",
          "Trichome production beginning",
          "Increase bloom booster",
          "EC 2.0–2.4",
          "Lower humidity to 40–50%",
        ],
      },
      {
        week: 5,
        title: "Peak Flowering",
        tips: [
          "Buds gaining significant size and weight",
          "Strong terpene aromas emerging",
          "Max light intensity if environment allows",
          "EC 2.0–2.4 with high P & K",
          "Watch for signs of bud rot — airflow is critical",
        ],
      },
      {
        week: 6,
        title: "Trichome Explosion",
        tips: [
          "Resin glands fully forming",
          "Trichomes mostly clear, turning cloudy",
          "Begin reducing nitrogen to zero",
          "EC 1.8–2.2",
          "Humidity: 35–45%, temp: 65–75°F",
        ],
      },
      {
        week: 7,
        title: "Ripening Phase",
        tips: [
          "Trichomes 50%+ cloudy",
          "Begin flush if desired (2 weeks before harvest)",
          "Pistils darkening and curling",
          "Reduce EC significantly or flush with plain water",
          "Harvest window is approaching",
        ],
      },
      {
        week: 8,
        title: "Pre-Harvest",
        tips: [
          "Check trichomes daily with loupe/scope",
          "Harvest when 70–80% cloudy, 10–20% amber",
          "More amber = more sedative effect",
          "Continue flushing",
          "Lower humidity to prevent mold on dense buds",
        ],
      },
      {
        week: 9,
        title: "Late Ripening",
        tips: [
          "Extended genetics may need another week or two",
          "Trichomes are your best harvest indicator",
          "Plant may show signs of senescence (yellowing leaves — normal)",
          "Stop feeding entirely — flush only",
          "48-hour dark period before harvest (optional)",
        ],
      },
    ],
  },
  harvest: {
    icon: Scissors,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    label: "Harvest & Cure",
    weeks: [
      {
        week: 1,
        title: "Harvest Day & Wet Trim",
        tips: [
          "Cut plant at base, remove large fan leaves",
          "Wet trim: remove sugar leaves now for convenience",
          "Dry trim: hang whole branches, trim after drying",
          "Hang or rack in dark room — 60°F, 60% RH",
          "Aim for 7–14 day dry time",
        ],
      },
      {
        week: 2,
        title: "Drying",
        tips: [
          "Small stems should snap, not bend, when ready",
          "Do not rush — slow dry = better taste",
          "Maintain 60°F / 60% RH consistently",
          "Check daily for mold",
          "Buds ready when outside is dry but inside still moist",
        ],
      },
      {
        week: 3,
        title: "Curing Begins",
        tips: [
          "Trim and jar in airtight mason jars (75% full)",
          "Burp jars 15 min daily for first week",
          "Target 58–62% RH inside jars (use Boveda packs)",
          "Store in cool, dark location",
          "Minimum 3-week cure for smooth smoke",
        ],
      },
      {
        week: 4,
        title: "Active Curing",
        tips: [
          "Burp jars every 2–3 days now",
          "Terpenes are developing and improving",
          "Chlorophyll breaking down — harshness fading",
          "Flavor and aroma will peak around week 6–8",
          "Keep humidity in check — mold can still occur",
        ],
      },
    ],
  },
};

function getStageAndWeek(strain) {
  const today = new Date();
  const planted = strain.planted_date ? new Date(strain.planted_date) : null;
  const flipped = strain.flipped_to_flower_date ? new Date(strain.flipped_to_flower_date) : null;
  const harvested = strain.harvest_date ? new Date(strain.harvest_date) : null;

  if (harvested && today >= harvested) {
    const daysSinceHarvest = differenceInDays(today, harvested);
    const week = Math.min(Math.floor(daysSinceHarvest / 7) + 1, STAGES.harvest.weeks.length);
    const dayInWeek = (daysSinceHarvest % 7) + 1;
    return { stage: "harvest", week, dayInWeek, totalDays: daysSinceHarvest };
  }

  if (flipped) {
    const flowerDays = differenceInDays(today, flipped);
    const week = Math.min(Math.floor(flowerDays / 7) + 1, STAGES.flowering.weeks.length);
    const dayInWeek = (flowerDays % 7) + 1;
    return { stage: "flowering", week, dayInWeek, totalDays: flowerDays };
  }

  if (planted) {
    const vegDays = differenceInDays(today, planted);
    if (vegDays <= 7) {
      const dayInWeek = (vegDays % 7) + 1;
      return { stage: "germination", week: 1, dayInWeek, totalDays: vegDays };
    }
    const vegWeeksDays = vegDays - 7;
    const week = Math.min(Math.floor(vegWeeksDays / 7) + 1, STAGES.vegetative.weeks.length);
    const dayInWeek = (vegWeeksDays % 7) + 1;
    return { stage: "vegetative", week, dayInWeek, totalDays: vegDays };
  }

  return null;
}

export default function GrowProgressTracker({ strain }) {
  const [expanded, setExpanded] = useState(true);

  const progress = getStageAndWeek(strain);

  if (!progress) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-white font-medium mb-2">Grow Progress</h3>
        <p className="text-white/30 text-sm">Set a planted date to track weekly progression and tips.</p>
      </div>
    );
  }

  const { stage, week, dayInWeek, totalDays } = progress;
  const stageConfig = STAGES[stage];
  const Icon = stageConfig.icon;
  const weekData = stageConfig.weeks[Math.min(week - 1, stageConfig.weeks.length - 1)];

  const stageOrder = ["germination", "vegetative", "flowering", "harvest"];
  const currentStageIndex = stageOrder.indexOf(stage);

  return (
    <div className={`rounded-2xl border ${stageConfig.border} ${stageConfig.bg} p-6`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${stageConfig.color}`} />
          <div className="text-left">
            <h3 className="text-white font-medium">Grow Progress Tracker</h3>
            <p className={`text-xs ${stageConfig.color}`}>{stageConfig.label} — Week {week}, Day {dayInWeek}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-white text-sm font-medium">{weekData.title}</div>
            <div className="text-white/40 text-xs">{totalDays} days total</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {/* Stage Progress Bar */}
      <div className="flex gap-1 mb-4">
        {stageOrder.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col gap-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i < currentStageIndex ? "bg-white/40" :
                i === currentStageIndex ? stageConfig.color.replace("text-", "bg-") :
                "bg-white/10"
              }`}
            />
            <span className={`text-[9px] text-center ${i === currentStageIndex ? stageConfig.color : "text-white/20"}`}>
              {STAGES[s].label.slice(0, 4)}
            </span>
          </div>
        ))}
      </div>

      {expanded && (
        <>
          {/* Week indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`rounded-lg px-3 py-1.5 ${stageConfig.bg} border ${stageConfig.border}`}>
              <span className={`text-xs font-semibold ${stageConfig.color}`}>Week {week}</span>
            </div>
            <div className="rounded-lg px-3 py-1.5 bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">Day {dayInWeek} of 7</span>
            </div>
            <div className="rounded-lg px-3 py-1.5 bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">{totalDays} days in</span>
            </div>
          </div>

          {/* Day progress within week */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/30 mb-1">
              <span>Week {week} progress</span>
              <span>Day {dayInWeek}/7</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${stageConfig.color.replace("text-", "bg-")}`}
                style={{ width: `${(dayInWeek / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* What to expect this week */}
          <div>
            <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
              {weekData.title} — What to expect
            </h4>
            <ul className="space-y-1.5">
              {weekData.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${stageConfig.color.replace("text-", "bg-")}`} />
                  <span className="text-white/60 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upcoming stages preview */}
          {currentStageIndex < stageOrder.length - 1 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-white/20 text-xs">
                Next stage: <span className="text-white/40">{STAGES[stageOrder[currentStageIndex + 1]].label}</span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}