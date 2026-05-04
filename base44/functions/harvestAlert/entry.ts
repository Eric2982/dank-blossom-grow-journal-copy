import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allStrains = await base44.asServiceRole.entities.Strain.list();

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingHarvests = allStrains.filter((strain) => {
      if (!strain.harvest_date || strain.status === 'harvested') return false;
      const harvestDate = new Date(strain.harvest_date);
      return harvestDate >= now && harvestDate <= threeDaysFromNow;
    });

    if (upcomingHarvests.length === 0) {
      return Response.json({ sent: 0, message: 'No upcoming harvests within 3 days' });
    }

    // Group by user email (created_by)
    const byUser = {};
    for (const strain of upcomingHarvests) {
      const email = strain.created_by;
      if (!email) continue;
      if (!byUser[email]) byUser[email] = [];
      byUser[email].push(strain);
    }

    let sent = 0;
    for (const [email, strains] of Object.entries(byUser)) {
      const strainList = strains
        .map((s) => {
          const days = Math.ceil((new Date(s.harvest_date) - now) / (1000 * 60 * 60 * 24));
          return `• <strong>${s.name}</strong> — harvest in <strong>${days} day${days !== 1 ? 's' : ''}</strong> (${s.harvest_date})`;
        })
        .join('<br>');

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `🌿 Harvest Alert: ${strains.length} strain${strains.length > 1 ? 's' : ''} ready soon`,
        body: `
          <div style="font-family: sans-serif; max-width: 480px;">
            <h2 style="color: #16a34a;">Harvest Alert</h2>
            <p>The following strain${strains.length > 1 ? 's are' : ' is'} approaching harvest in the next 3 days:</p>
            <p>${strainList}</p>
            <p style="color: #6b7280; font-size: 0.9em;">Log in to Dank Blossom to manage your grow.</p>
          </div>
        `,
      });
      sent++;
    }

    return Response.json({ sent, upcoming: upcomingHarvests.map((s) => s.name) });
  } catch (error) {
    console.error('harvestAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});