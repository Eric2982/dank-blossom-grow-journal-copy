import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    if (webhookSecret && sig) {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log('Stripe event:', event.type);

    const getEmail = (obj) =>
      obj?.metadata?.user_email || obj?.customer_email || null;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = getEmail(session);
      if (!userEmail) { console.warn('No user_email in session'); return Response.json({ received: true }); }

      const subscriptionId = session.subscription;
      const customerId = session.customer;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
      const payload = {
        user_email: userEmail,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: subscription.status,
        plan: 'premium',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, payload);
      } else {
        await base44.asServiceRole.entities.Subscription.create(payload);
      }
      console.log('Subscription created for', userEmail);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customerId = sub.customer;
      const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
        console.log('Subscription updated for customer', customerId, '->', sub.status);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});