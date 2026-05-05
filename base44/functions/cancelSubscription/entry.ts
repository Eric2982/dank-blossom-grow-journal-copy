import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const subs = await base44.entities.Subscription.filter({ user_email: user.email });
    if (!subs || subs.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const sub = subs[0];
    if (!sub.stripe_subscription_id) {
      return Response.json({ error: 'No Stripe subscription ID found' }, { status: 400 });
    }

    // Cancel at period end (user retains access until billing period ends)
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update local record
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      status: 'canceled',
    });

    console.log('Subscription canceled for', user.email);
    return Response.json({ success: true });
  } catch (error) {
    console.error('cancelSubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});