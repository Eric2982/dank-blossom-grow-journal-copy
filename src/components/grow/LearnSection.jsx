import React, { useState } from "react";
import { ChevronDown, Leaf, AlertTriangle, BookOpen, Lightbulb, ExternalLink, Scissors, Wind, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  {
    id: "vpd",
    icon: Wind,
    title: "Understanding VPD (Vapor Pressure Deficit)",
    color: "text-violet-400",
    content: `**Vapor Pressure Deficit (VPD)** is the difference between the amount of moisture currently in the air and the maximum amount the air can hold at saturation. It's one of the most critical metrics for cannabis cultivation.

**Why VPD Matters:**
VPD directly controls transpiration rate - the process plants use to move water and nutrients from roots to leaves. Proper VPD ensures optimal nutrient uptake, growth rate, and prevents mold/mildew issues.

**Ideal VPD Ranges by Growth Stage:**
• Clones/Seedlings: 0.4–0.8 kPa (low VPD = less transpiration stress)
• Early Vegetative: 0.8–1.0 kPa
• Late Vegetative: 1.0–1.2 kPa
• Early Flowering: 1.0–1.5 kPa
• Late Flowering: 1.2–1.6 kPa (higher VPD = less mold risk)

**Effects of Incorrect VPD:**
• Too Low (<0.4 kPa): Reduced transpiration, slow growth, increased risk of powdery mildew and bud rot
• Too High (>1.6 kPa): Excessive transpiration, plant stress, leaf curling, nutrient burn symptoms

**How to Calculate VPD:**
VPD = VPsat - VPair
Where VPsat = saturated vapor pressure at leaf temperature
VPair = vapor pressure of ambient air

**Practical Tips:**
- Use a VPD calculator app or chart
- Leaf temperature is typically 2-4°F cooler than air temperature
- Adjust humidity gradually (5-10% per week) when transitioning growth stages
- Night-time VPD is less critical but should stay above 0.4 kPa`,
    resources: [
      { title: "Quest Climate - VPD Chart & Calculator", url: "https://www.questclimate.com/vpd-chart-vapor-pressure-deficit/" },
      { title: "Royal Queen Seeds - Complete VPD Guide", url: "https://www.royalqueenseeds.com/blog-vpd-chart-cannabis-n1042" },
      { title: "Pulse - Understanding VPD in Cannabis", url: "https://pulsegrow.com/blogs/learn/vpd" }
    ]
  },
  {
    id: "ppfd",
    icon: Lightbulb,
    title: "PPFD, PAR & Light Optimization",
    color: "text-yellow-400",
    content: `**Photosynthetic Photon Flux Density (PPFD)** measures the amount of photosynthetically active radiation (PAR) reaching your canopy in µmol/m²/s.

**Understanding Light Metrics:**
• PAR: Light spectrum plants use for photosynthesis (400-700nm)
• PPFD: Amount of PAR photons hitting a surface per second
• DLI (Daily Light Integral): Total PAR received over 24 hours

**Recommended PPFD by Growth Stage:**
• Seedlings/Clones: 100–300 µmol/m²/s
• Early Vegetative: 300–400 µmol/m²/s
• Late Vegetative: 400–600 µmol/m²/s
• Early Flowering: 600–800 µmol/m²/s
• Mid-Late Flowering: 800–1000 µmol/m²/s
• Maximum (with CO₂): 1000–1500 µmol/m²/s

**DLI Target Ranges:**
• Vegetative: 25–35 mol/m²/day
• Flowering: 35–45 mol/m²/day
• With CO₂ enrichment: 45–65 mol/m²/day

**Calculate DLI:**
DLI = (PPFD × 3600 × photoperiod hours) ÷ 1,000,000

**Light Schedules:**
• Photoperiod Veg: 18/6 or 20/4
• Photoperiod Flower: 12/12 (critical - do not interrupt dark period)
• Autoflower: 18/6, 20/4, or 24/0 throughout lifecycle

**Light Positioning:**
• Seedlings: 24-36 inches from light source
• Vegetative: 18-24 inches
• Flowering: 12-18 inches (LED), 18-24 inches (HPS)
• Monitor for light stress: bleaching, tacoing leaves, or foxtailing`,
    resources: [
      { title: "Photone App - Turn Phone Into PAR Meter", url: "https://photoneapp.com/" },
      { title: "Migro LED - Light Science & Reviews", url: "https://migrolight.com/blogs/grow-lights" },
      { title: "Fluence - DLI Calculator", url: "https://fluence.science/science-articles/dli-daily-light-integral-calculator/" },
      { title: "Cocoforcannabis - Light Intensity Guide", url: "https://www.cocoforcannabis.com/light-guide/" }
    ]
  },
  {
    id: "ec",
    icon: Droplets,
    title: "EC, PPM & Nutrient Management",
    color: "text-emerald-400",
    content: `**Electrical Conductivity (EC)** measures total dissolved salts in your nutrient solution. It's the most reliable way to gauge nutrient strength.

**EC vs PPM:**
• EC is measured in mS/cm or dS/m
• PPM = EC × conversion factor (500 or 700 scale)
• Always use EC for consistency across meters

**Recommended EC Ranges:**
• Seedlings: 0.4–0.8 mS/cm
• Early Vegetative: 0.8–1.3 mS/cm
• Late Vegetative: 1.3–1.8 mS/cm
• Transition/Early Flower: 1.5–2.0 mS/cm
• Mid Flowering: 1.8–2.3 mS/cm
• Late Flowering (flush): 0.0–0.5 mS/cm

**Reading Runoff EC:**
Always measure both input and runoff EC:
• Runoff EC higher than input by 0.3+ = salt buildup, flush needed
• Runoff EC lower than input = plants feeding heavily, may increase feed
• Target: Runoff EC within 0.2 mS/cm of input EC

**NPK Ratios by Stage:**
• Vegetative: 3-1-2 (N-P-K) - Higher nitrogen for leaf growth
• Transition: 2-2-2 - Balanced feeding
• Early Flower: 1-2-2 - Increase P & K
• Mid-Late Flower: 1-3-3 - Maximum P & K
• Ripening: 0-1-2 - Low N, maintain P & K

**Feeding Best Practices:**
- Start at 50% manufacturer recommendations
- Increase gradually (0.1-0.2 mS/cm per week)
- "Feed, Feed, Water" schedule in soil
- Hydro/coco: Feed every watering
- Monitor plant response, not just numbers
- Flush 2 weeks before harvest (soil) or 1 week (hydro)`,
    resources: [
      { title: "General Hydroponics - Official Feed Charts", url: "https://generalhydroponics.com/feedcharts" },
      { title: "Bluelab - EC/TDS/PPM Guide", url: "https://www.bluelab.com/learning-center/ec-tds-and-cf" },
      { title: "Cocoforcannabis - Nutrient Guide", url: "https://www.cocoforcannabis.com/guide-to-cannabis-nutrients/" }
    ]
  },
  {
    id: "deficiencies",
    icon: AlertTriangle,
    title: "Nutrient Deficiencies - Complete Guide",
    color: "text-rose-400",
    content: `**MOBILE NUTRIENTS** (move from old growth to new):

**Nitrogen (N) Deficiency:**
Symptoms: Lower leaves turn pale yellow, then bright yellow, eventually fall off. Slow growth, small leaves.
Causes: Low N in nutrients, pH lockout (below 6.0 in soil), underfed plants
Solution: Increase base nutrients, add nitrogen supplement, check pH
Timeline: Recovery in 5-7 days

**Phosphorus (P) Deficiency:**
Symptoms: Dark blue-green leaves, purple/red stems and petioles, slow growth, small leaves, purple undersides
Causes: Cold temperatures, pH lockout (above 7.0), low P in flowering nutrients
Solution: Increase bloom nutrients, warm root zone, check pH
Timeline: Recovery in 7-10 days

**Potassium (K) Deficiency:**
Symptoms: Brown/burnt leaf edges and tips, yellowing between veins on older leaves, weak stems
Causes: pH lockout, low K in bloom nutrients, excess calcium
Solution: Increase bloom nutrients, check pH, add potassium supplement
Timeline: Recovery in 5-7 days

**Magnesium (Mg) Deficiency:**
Symptoms: Interveinal chlorosis (yellowing between veins) on older leaves, rust spots
Causes: Low Mg in nutrients, pH lockout (below 6.0), excess calcium, LED lights (common)
Solution: Foliar spray Epsom salt (1 tsp/quart), add Cal-Mag, check pH
Timeline: Foliar spray shows results in 2-3 days

**IMMOBILE NUTRIENTS** (stay in place, affect new growth):

**Calcium (Ca) Deficiency:**
Symptoms: Brown spots on new growth, twisted/curled leaf tips, weak stems, blossom end rot
Causes: Low Ca in nutrients, pH lockout, inconsistent watering, low humidity
Solution: Add Cal-Mag, maintain consistent watering, check pH
Timeline: New growth shows improvement in 5-7 days

**Iron (Fe) Deficiency:**
Symptoms: Interveinal chlorosis on new growth (younger leaves yellow, veins stay green)
Causes: pH lockout (above 7.0), excess phosphorus, root issues
Solution: Lower pH to 6.0-6.5, add iron chelate, foliar spray
Timeline: Recovery in 5-7 days

**Sulfur (S) Deficiency:**
Symptoms: Yellowing new growth, similar to nitrogen but affects new leaves
Causes: Rare in complete nutrients, pH lockout
Solution: Flush and reset nutrients, check pH
Timeline: Recovery in 7-10 days

**Zinc (Zn) Deficiency:**
Symptoms: Twisted new growth, interveinal chlorosis on new leaves, short internodes
Causes: High pH (above 7.0), excess phosphorus
Solution: Lower pH, add micronutrient supplement
Timeline: Recovery in 7-10 days

**CRITICAL TIPS:**
- 80% of deficiencies are caused by pH lockout, not lack of nutrients
- Check pH first, adjust nutrients second
- Don't over-correct - make small adjustments
- Take photos to track progression
- Damaged leaves won't recover - watch new growth
- When in doubt, flush with pH'd water and start fresh`,
    resources: [
      { title: "Grow Weed Easy - Picture Diagnosis Tool", url: "https://www.growweedeasy.com/cannabis-symptoms-pictures" },
      { title: "Royal Queen Seeds - Deficiency Chart", url: "https://www.royalqueenseeds.com/blog-cannabis-nutrient-deficiency-chart-n757" },
      { title: "Cocoforcannabis - Nutrient Disorders", url: "https://www.cocoforcannabis.com/cannabis-nutrient-disorders/" }
    ]
  },
  {
    id: "ph",
    icon: BookOpen,
    title: "pH - The Master Key",
    color: "text-pink-400",
    content: `**pH** controls nutrient availability. Perfect nutrients with wrong pH = lockout and deficiencies.

**Optimal pH Ranges:**
• Soil: 6.0–7.0 (sweet spot: 6.3–6.8)
• Coco Coir: 5.8–6.5 (sweet spot: 5.8–6.2)
• Hydroponics: 5.5–6.5 (sweet spot: 5.8–6.0)
• Rockwool: 5.5–6.0

**Nutrient Availability by pH:**
• 5.5-6.0: Optimal for P, K, Ca, Mg, S
• 6.0-6.5: Optimal for N, Fe, Mn, B, Zn
• 6.5-7.0: Optimal for Mo

**pH Drift Strategy:**
Rather than targeting one pH, allow drift within the optimal range:
• Day 1: pH 5.8
• Day 2: pH 6.0
• Day 3: pH 6.2
This ensures all nutrients get absorbed at their optimal pH.

**How to Measure pH:**
1. Calibrate pH meter monthly with 7.0 and 4.0 solutions
2. Measure runoff pH, not just input
3. Test at same time each day for consistency
4. Digital meters > drops > strips for accuracy

**Adjusting pH:**
• pH Down: Phosphoric acid or citric acid
• pH Up: Potassium hydroxide or silicate
• Add slowly, stir, wait 15 minutes, retest
• Always adjust pH AFTER mixing all nutrients

**pH Lockout Recovery:**
1. Flush with pH'd water (3x pot volume)
2. Let medium dry slightly
3. Resume feeding at lower EC (50% strength)
4. Gradually increase to normal over 1 week`,
    resources: [
      { title: "Grow Weed Easy - pH Perfect Guide", url: "https://www.growweedeasy.com/ph" },
      { title: "Advanced Nutrients - pH Perfect Tech", url: "https://www.advancednutrients.com/articles/ph-perfect-technology/" },
      { title: "Bluelab - pH & Nutrient Uptake", url: "https://www.bluelab.com/learning-center/ph-and-nutrient-uptake" }
    ]
  },
  {
    id: "environment",
    icon: Leaf,
    title: "Climate Control & Environmental Factors",
    color: "text-blue-400",
    content: `**Temperature Ranges:**
• Seedlings: 75–80°F (24–27°C) constant
• Vegetative: 70–85°F lights on, 65–75°F lights off
• Flowering: 68–78°F lights on, 60–70°F lights off
• Late Flowering: 65–75°F (cooler temps enhance color and terpenes)
• Critical: Keep day/night temp difference under 15°F to prevent stretch

**Relative Humidity (RH) Targets:**
• Clones/Seedlings: 65–75% RH
• Early Veg: 60–70% RH
• Late Veg: 50–60% RH
• Early Flower (weeks 1-3): 45–55% RH
• Mid Flower (weeks 4-6): 40–50% RH
• Late Flower (weeks 7+): 35–45% RH
• Drying: 55–60% RH at 60–65°F

**CO₂ Enrichment:**
• Ambient: ~400 PPM
• Recommended: 800–1200 PPM
• Maximum: 1500 PPM
• Only beneficial with sufficient light (800+ PPFD)
• Requires sealed room (no exhaust during lights on)
• Increase nutrients 25-50% with CO₂

**Airflow & Circulation:**
• Goal: Gentle leaf movement, not leaf flutter
• Air should exchange every 3-5 minutes
• Place oscillating fans above and below canopy
• Exhaust fan: Calculate CFM = (grow space cubic feet) ÷ 3
• Passive intake should be 2-3x larger than exhaust
• Positive pressure = odors escape; Negative = contained

**Light Leaks in Flower:**
• Total darkness required during 12 hour dark period
• Even small LED indicators can cause stress/hermies
• Check for light leaks with eyes adjusted to darkness
• Cover all gaps, LEDs, and windows
• Use green LED for safe work light if needed`,
    resources: [
      { title: "Perfect Grower - Environment Guide", url: "https://perfectgrower.com/knowledge/temperature-humidity-guide/" },
      { title: "Grow Weed Easy - Temperature Tutorial", url: "https://www.growweedeasy.com/temperature" },
      { title: "Quest - Humidity Control Guide", url: "https://www.questclimate.com/humidity-control-guide/" }
    ]
  },
  {
    id: "training",
    icon: Scissors,
    title: "Training Techniques - LST, HST, Topping & More",
    color: "text-purple-400",
    content: `**LOW STRESS TRAINING (LST):**
Best for: All growers, small spaces, autoflowers
When: Start in early veg (3-4 nodes)
How: Gently bend main stem and tie down to create even canopy
Benefits: Increased yield (20-40%), better light penetration, no recovery time
Tips: Train daily, use soft ties, aim for horizontal main stem

**TOPPING:**
Best for: Photoperiod plants, creating multiple colas
When: After 4-6 nodes, at least 2 weeks into veg
How: Cut main stem above 3rd-5th node, removing top growth
Recovery: 3-7 days
Benefits: 2 main colas from 1, bushier plants, controlled height
Variations: FIM (less stress, 4 colas but less consistent)

**SUPER CROPPING:**
Best for: Controlling height, strengthening stems
When: Late veg or first 2 weeks of flower
How: Pinch and bend stem 90° without breaking skin
Recovery: 3-5 days
Benefits: Stronger stems, increased nutrient flow, height control
Warning: Higher stress - not for autoflowers or weak plants

**SCREEN OF GREEN (SCROG):**
Best for: Maximum yield in limited space
When: Install net at 8-12" height in late veg
How: Weave branches through net, maintain even canopy
Benefits: +40-50% yield increase, optimal light usage
Requirements: 1-2 week veg after net installation, difficult to access plants

**SEA OF GREEN (SOG):**
Best for: Fast harvest, many small plants
When: Minimal veg time (1-2 weeks after rooting)
How: Pack many small plants (4-16 per sqft) and flip to flower quickly
Benefits: Fastest harvest (8-10 weeks total), works with clones
Downsides: Higher plant count (legal issue in some areas)

**LOLLIPOPPING:**
Best for: Indoor grows with lower canopy
When: First defoliation day 1 of flower, second at day 21
How: Remove all growth below top 1/3 of plant
Benefits: Larger top buds, better airflow, no popcorn buds
Combine with: SCROG or main-lining for best results

**MAINLINING (MANIFOLD):**
Best for: Perfect symmetry, advanced growers
When: Start after 3rd node, 4+ weeks veg required
How: Top to 3rd node, remove everything below, train 8 equal colas
Recovery: Extended veg time (add 2-3 weeks)
Benefits: Perfectly even canopy, 8 identical colas, stunning structure

**DEFOLIATION:**
Heavy Defoliation: Day 1 and Day 21 of flower (Schwazzing)
Light Defoliation: Weekly throughout grow
Remove: Large fan leaves blocking bud sites, yellowing leaves
Keep: Healthy leaves not blocking light
Benefits: Better light penetration, improved airflow
Warning: Don't remove more than 20-30% at once`,
    resources: [
      { title: "Grow Weed Easy - LST Tutorial", url: "https://www.growweedeasy.com/low-stress-training-lst" },
      { title: "Cocoforcannabis - Training Techniques", url: "https://www.cocoforcannabis.com/training-cannabis-plants/" },
      { title: "Nebula Haze - Manifold Mainlining", url: "https://www.growweedeasy.com/mainlining-nugbuckets" },
      { title: "Royal Queen Seeds - Complete Training Guide", url: "https://www.royalqueenseeds.com/blog-cannabis-plant-training-techniques-n1220" }
    ]
  },
  {
    id: "tips",
    icon: Lightbulb,
    title: "Pro Tips & Advanced Techniques",
    color: "text-amber-400",
    content: `**HARVEST & DRY/CURE:**

**When to Harvest:**
• Trichomes: 10-20% amber, 70-80% cloudy, 10% clear (peak potency)
• More amber = more sedative (couch-lock)
• More cloudy = more energetic (head high)
• Check multiple bud sites with 60x+ magnification

**Flushing:**
• Soil: 2 weeks before harvest
• Hydro/Coco: 1 week before harvest
• Use plain pH'd water
• Goal: Force plant to use stored nutrients for smoother smoke

**Drying:**
• Hang whole plant or branches in dark room
• Target: 60°F and 60% RH
• Duration: 7-14 days
• Ready when small stems snap (not bend)
• Dry too fast = harsh smoke; too slow = mold risk

**Curing:**
• Trim and place in airtight jars (mason jars ideal)
• Fill jars 75% full (not packed tight)
• First week: Open jars 15 mins daily ("burping")
• Week 2-4: Open every 2-3 days
• Keep RH in jars at 58-62% (use Boveda packs)
• Cure minimum 3 weeks, optimal 2-3 months

**TROUBLESHOOTING COMMON ISSUES:**

**Light Burn:**
Symptoms: Bleached/yellow tips on top buds only
Fix: Raise lights 4-6 inches, reduce intensity 10-20%

**Heat Stress:**
Symptoms: Leaf edges curling up (tacoing), yellowing
Fix: Increase airflow, reduce temperature, raise lights

**Overwatering:**
Symptoms: Droopy leaves, slow growth, yellow lower leaves
Fix: Let soil dry out, water less frequently, improve drainage

**Root Rot:**
Symptoms: Brown slimy roots, plant wilting despite wet soil
Fix: Increase oxygen to roots, reduce water temp below 72°F, add beneficial bacteria

**Bud Rot (Botrytis):**
Symptoms: Gray/white mold on buds, spreading fast
Fix: Cut out affected areas +2" margin, lower humidity, increase airflow
Prevention: Keep humidity below 50% in flower

**YIELD MAXIMIZATION:**

**Best Practices:**
• Healthy root system = bigger yields (use fabric pots)
• More light = more yield (up to 1000 PPFD)
• Training techniques: +20-50% yield
• Proper nutrients: Don't overfeed
• Optimize VPD throughout grow
• Defoliate strategically in flower
• Long enough veg time (6-8 weeks for photos)

**Realistic Expectations:**
• Indoor: 0.5-1.5 g/watt (average growers)
• Pro indoor: 1.5-2.0+ g/watt
• First grow: 1-3 oz per plant (normal!)
• Outdoor: 1-5+ lbs per plant (full season)`,
    resources: [
      { title: "Grow Weed Easy - Harvest & Cure", url: "https://www.growweedeasy.com/harvest" },
      { title: "Boveda - Official Cure Guide", url: "https://bovedainc.com/support/herbal/" },
      { title: "Royal Queen Seeds - Drying & Curing", url: "https://www.royalqueenseeds.com/blog-how-to-dry-and-cure-cannabis-buds-n209" },
      { title: "Nebula Haze - Troubleshooting Tool", url: "https://www.growweedeasy.com/cannabis-symptoms-pictures" }
    ]
  }
];

function AccordionItem({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <Icon className={`w-5 h-5 ${section.color} shrink-0`} />
        <span className="text-white font-medium text-sm flex-1">{section.title}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="text-white/50 text-sm leading-relaxed whitespace-pre-line mb-4">
                {section.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-white/80">{part}</strong> : part
                )}
              </div>
              {section.resources && (
                <div className="pt-3 border-t border-white/5">
                  <div className="text-white/40 text-xs font-medium mb-2">References & Resources:</div>
                  <div className="space-y-1.5">
                    {section.resources.map((resource, idx) => (
                      <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs transition-colors group">
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearnSection() {
  return (
    <div className="space-y-3">
      {sections.map(section => (
        <AccordionItem key={section.id} section={section} />
      ))}
    </div>
  );
}