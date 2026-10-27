// POST /api/stripe-webhook  - Stripe events for paid memberships.
// Verified with STRIPE_WEBHOOK_SECRET. Does nothing until Stripe env vars exist.
import { updateDoc, getStripe, json } from './_lib/store.mjs';

const LIVE = new Set(['active', 'trialing', 'past_due']);

async function setStatus(match, patch) {
  return updateDoc((doc) => {
    const m = doc.members.find(match);
    if (!m) return false;
    Object.assign(m, patch, { updatedAt: new Date().toISOString() });
    return true;
  });
}

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return json({ error: 'Stripe is not configured' }, 503);
  }
  const stripe = await getStripe();
  const raw = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, request.headers.get('stripe-signature') || '', process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return json({ error: 'Bad signature' }, 400);
  }

  try {
    const obj = event.data.object;
    if (event.type === 'checkout.session.completed' && obj.mode === 'subscription') {
      const id = (obj.metadata && obj.metadata.memberId) || obj.client_reference_id;
      if (id) {
        await setStatus((m) => m.id === id, {
          status: 'active', plan: 'paid',
          stripeCustomer: typeof obj.customer === 'string' ? obj.customer : obj.customer && obj.customer.id,
          stripeSubscription: typeof obj.subscription === 'string' ? obj.subscription : obj.subscription && obj.subscription.id,
          paidAt: new Date().toISOString(),
        });
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const id = obj.metadata && obj.metadata.memberId;
      const live = event.type === 'customer.subscription.updated' && LIVE.has(obj.status);
      await setStatus((m) => (id && m.id === id) || m.stripeSubscription === obj.id, {
        status: live ? 'active' : 'lapsed', stripeStatus: obj.status,
      });
    }
    return json({ received: true });
  } catch (e) {
    console.error('webhook handling failed', e);
    return json({ error: 'Handler failed' }, 500); // Stripe will retry
  }
}
