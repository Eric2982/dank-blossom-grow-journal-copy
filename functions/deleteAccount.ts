import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.email;

    // Fetch all user-owned records in parallel
    const [strains, readings, nutrients, schedules, actions, plans, harvests, messages, forumPosts, challengeEntries, challengeVotes] = await Promise.all([
      base44.entities.Strain.list(),
      base44.entities.GrowReading.list(),
      base44.entities.NutrientLog.list(),
      base44.entities.WateringSchedule.list(),
      base44.entities.WateringAction.list(),
      base44.entities.FeedingPlan.list(),
      base44.entities.Harvest.list(),
      base44.entities.ChatMessage.filter({ user_email: userEmail }),
      base44.entities.ForumPost.filter({ author_email: userEmail }),
      base44.entities.ChallengeEntry.filter({ user_email: userEmail }),
      base44.entities.ChallengeVote.filter({ voter_email: userEmail }),
    ]);

    // Delete all records in parallel
    await Promise.all([
      ...strains.map(r => base44.entities.Strain.delete(r.id)),
      ...readings.map(r => base44.entities.GrowReading.delete(r.id)),
      ...nutrients.map(r => base44.entities.NutrientLog.delete(r.id)),
      ...schedules.map(r => base44.entities.WateringSchedule.delete(r.id)),
      ...actions.map(r => base44.entities.WateringAction.delete(r.id)),
      ...plans.map(r => base44.entities.FeedingPlan.delete(r.id)),
      ...harvests.map(r => base44.entities.Harvest.delete(r.id)),
      ...messages.map(r => base44.entities.ChatMessage.delete(r.id)),
      ...forumPosts.map(r => base44.entities.ForumPost.delete(r.id)),
      ...challengeEntries.map(r => base44.entities.ChallengeEntry.delete(r.id)),
      ...challengeVotes.map(r => base44.entities.ChallengeVote.delete(r.id)),
    ]);

    return Response.json({ success: true, deleted: { strains: strains.length, readings: readings.length, nutrients: nutrients.length } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});