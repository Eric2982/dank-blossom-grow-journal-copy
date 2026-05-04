import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { strainId } = await req.json();
    if (!strainId) return Response.json({ error: 'strainId required' }, { status: 400 });

    // Fetch all relevant data in parallel
    const [strain, readings, nutrients, wateringSchedules, feedingPlans] = await Promise.all([
      base44.entities.Strain.filter({ id: strainId }),
      base44.entities.GrowReading.filter({ strain_id: strainId }),
      base44.entities.NutrientLog.filter({ strain_id: strainId }),
      base44.entities.WateringSchedule.filter({ strain_id: strainId }),
      base44.entities.FeedingPlan.filter({ strain_id: strainId }),
    ]);

    const s = strain[0];
    if (!s) return Response.json({ error: 'Strain not found' }, { status: 404 });

    // Determine current stage and week
    const now = new Date();
    let currentStage = 'germination';
    let weekInStage = 1;
    let totalWeeks = 0;

    if (s.planted_date) {
      const planted = new Date(s.planted_date);
      totalWeeks = Math.floor((now - planted) / (1000 * 60 * 60 * 24 * 7));

      if (s.harvest_date && now >= new Date(s.harvest_date)) {
        currentStage = 'harvest';
      } else if (s.flipped_to_flower_date && now >= new Date(s.flipped_to_flower_date)) {
        currentStage = 'flowering';
        weekInStage = Math.floor((now - new Date(s.flipped_to_flower_date)) / (1000 * 60 * 60 * 24 * 7)) + 1;
      } else if (totalWeeks >= 2) {
        currentStage = 'vegetative';
        weekInStage = totalWeeks - 2 + 1;
      } else {
        currentStage = 'germination';
        weekInStage = totalWeeks + 1;
      }
    }

    // Recent readings (last 7)
    const recentReadings = readings
      .sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date))
      .slice(0, 7);

    const avgTemp = recentReadings.length
      ? (recentReadings.reduce((s, r) => s + (r.temperature || 0), 0) / recentReadings.length).toFixed(1)
      : null;
    const avgHumidity = recentReadings.length
      ? (recentReadings.reduce((s, r) => s + (r.humidity || 0), 0) / recentReadings.length).toFixed(1)
      : null;
    const avgEC = recentReadings.filter(r => r.ec).length
      ? (recentReadings.filter(r => r.ec).reduce((s, r) => s + r.ec, 0) / recentReadings.filter(r => r.ec).length).toFixed(2)
      : null;
    const avgPH = recentReadings.filter(r => r.ph).length
      ? (recentReadings.filter(r => r.ph).reduce((s, r) => s + r.ph, 0) / recentReadings.filter(r => r.ph).length).toFixed(2)
      : null;
    const avgVPD = recentReadings.filter(r => r.vpd).length
      ? (recentReadings.filter(r => r.vpd).reduce((s, r) => s + r.vpd, 0) / recentReadings.filter(r => r.vpd).length).toFixed(2)
      : null;

    // Recent nutrients (last 10)
    const recentNutrients = nutrients
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .map(n => `${n.nutrient_name} (${n.nutrient_type}) ${n.volume_ml}ml in ${n.water_volume_liters}L`);

    // Watering info
    const activeSchedule = wateringSchedules.find(w => w.active);
    const wateringInfo = activeSchedule
      ? `Every ${activeSchedule.frequency_days} days, last watered: ${activeSchedule.last_watered ? new Date(activeSchedule.last_watered).toLocaleDateString() : 'unknown'}`
      : 'No active watering schedule';

    // Current week feeding plan
    const currentFeedingPlan = feedingPlans.find(fp => fp.week === weekInStage && fp.stage === currentStage);

    const prompt = `You are an expert cannabis cultivation advisor with deep knowledge of plant biology, root development, nutrient science, and environmental optimization.

Analyze the following grow data for strain "${s.name}" (${s.type}, ${s.plant_type}) and provide detailed, actionable weekly recommendations.

CURRENT STATUS:
- Stage: ${currentStage} | Week ${weekInStage} in stage | Total grow weeks: ${totalWeeks}
- Status: ${s.status}
- Flowering time: ${s.flowering_time_weeks ? s.flowering_time_weeks + ' weeks' : 'unknown'}
- Planted: ${s.planted_date || 'unknown'}
- Flipped to flower: ${s.flipped_to_flower_date || 'not yet'}
- Expected harvest: ${s.harvest_date || 'unknown'}
- Breeder: ${s.breeder || 'unknown'}
- Notes: ${s.notes || 'none'}

ENVIRONMENTAL DATA (7-day averages from ${recentReadings.length} readings):
- Temperature: ${avgTemp ? avgTemp + '°F' : 'no data'}
- Humidity: ${avgHumidity ? avgHumidity + '%' : 'no data'}
- EC: ${avgEC ? avgEC + ' mS/cm' : 'no data'}
- pH: ${avgPH || 'no data'}
- VPD: ${avgVPD ? avgVPD + ' kPa' : 'no data'}

RECENT NUTRIENTS (last 10 applications):
${recentNutrients.length ? recentNutrients.join('\n') : 'No nutrient logs recorded'}

WATERING: ${wateringInfo}

CURRENT FEEDING PLAN (week ${weekInStage}):
${currentFeedingPlan ? `Stage: ${currentFeedingPlan.stage}, Target EC: ${currentFeedingPlan.target_ec}, Target pH: ${currentFeedingPlan.target_ph}` : 'No feeding plan set for this week'}

Please provide a structured JSON response with the following:
{
  "stage_summary": "Brief 1-2 sentence overview of where the plant is in its life cycle and what matters most right now",
  "health_score": <number 1-10 based on available data, 7 if insufficient data>,
  "alerts": [<array of urgent issues detected, e.g. pH out of range, VPD too high>],
  "recommendations": {
    "environment": {
      "title": "Environment & Climate",
      "items": [<3-4 specific actionable tips for temp, humidity, VPD, light for this exact stage/week>]
    },
    "roots": {
      "title": "Root Health & Development",
      "items": [<3-4 specific tips for root zone management, oxygen, beneficial microbes, root stimulants for this stage>]
    },
    "nutrients": {
      "title": "Nutrients & Feeding",
      "items": [<3-4 specific feeding recommendations with EC/pH targets, what to add or reduce for this exact week>]
    },
    "watering": {
      "title": "Watering & Irrigation",
      "items": [<2-3 watering tips for this stage including frequency, runoff, drought stress techniques if applicable>]
    },
    "plant_health": {
      "title": "Plant Health & Training",
      "items": [<3-4 tips on canopy management, training, deficiency prevention, and what to watch for this week>]
    }
  },
  "next_week_preview": "What to expect and prepare for next week",
  "pro_tip": "One expert-level insight specific to this strain type and stage"
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          stage_summary: { type: 'string' },
          health_score: { type: 'number' },
          alerts: { type: 'array', items: { type: 'string' } },
          recommendations: {
            type: 'object',
            properties: {
              environment: { type: 'object', properties: { title: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } },
              roots: { type: 'object', properties: { title: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } },
              nutrients: { type: 'object', properties: { title: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } },
              watering: { type: 'object', properties: { title: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } },
              plant_health: { type: 'object', properties: { title: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } },
            }
          },
          next_week_preview: { type: 'string' },
          pro_tip: { type: 'string' },
        }
      }
    });

    return Response.json({ advice: result, stage: currentStage, week: weekInStage });
  } catch (error) {
    console.error('growAdvisor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});