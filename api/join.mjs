// POST /api/join  - multipart form from join.html.
// Free mode (default): profile is saved as active and shows on the site straight away.
// Paid mode (STRIPE_SECRET_KEY + STRIPE_PRICE_ID + MEMBERSHIP_PAID=true): profile is saved
// as pending and the response carries a Stripe Checkout URL. The webhook activates it.
import {
  updateDoc, validateMember, readPhoto, savePhoto, newId, clientIp, rateLimited,
  paidMode, getStripe, json, errorResponse, requireStorage, UserError,
} from './_lib/store.mjs';

export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (rateLimited('join:' + ip, 5, 15 * 60 * 1000)) {
      return json({ error: 'Too many sign-ups from this connection. Try again in a little while or call 0432 910 369.' }, 429);
    }
    const len = Number(request.headers.get('content-length') || 0);
    if (len > 3 * 1024 * 1024) return json({ error: 'That upload is too big. Use a photo under 1.5MB.', field: 'photo' }, 413);

    let form;
    try { form = await request.formData(); } catch { throw new UserError('Could not read the form. Please try again.'); }

    // Honeypot and too-fast submissions: pretend it worked, save nothing.
    const started = Number(form.get('t') || 0);
    if (String(form.get('company_website') || '').trim() || (started && Date.now() - started < 2500)) {
      return json({ ok: true, id: null });
    }

    const fields = {};
    for (const k of ['name', 'trade', 'area', 'phone', 'bio', 'business', 'abn', 'email']) {
      const v = form.get(k); fields[k] = typeof v === 'string' ? v : '';
    }
    const data = validateMember(fields);
    const photo = await readPhoto(form.get('photo'));
    requireStorage();

    const id = newId();
    const saved = await savePhoto(id, photo);
    const paid = paidMode();
    const now = new Date().toISOString();
    const member = {
      id, ...data,
      photo: saved.url, photoPath: saved.pathname, photoStore: saved.store,
      status: paid ? 'pending' : 'active',
      hidden: false,
      plan: paid ? 'paid' : 'free',
      createdAt: now, updatedAt: now,
      ip,
    };

    await updateDoc((doc) => {
      const dupe = doc.members.find((m) => m.tel === member.tel && m.trade === member.trade && m.status !== 'deleted');
      if (dupe && dupe.status === 'active') {
        throw new UserError('There is already a profile with this phone number under ' + member.trade + '. Message Sam on 0432 910 369 to change it.', 'phone');
      }
      doc.members.push(member);
    });

    if (!paid) return json({ ok: true, id, paid: false });

    const stripe = await getStripe();
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: member.email || undefined,
      client_reference_id: id,
      metadata: { memberId: id },
      subscription_data: { metadata: { memberId: id } },
      success_url: `${origin}/joined?id=${encodeURIComponent(id)}&paid=1`,
      cancel_url: `${origin}/join?cancelled=1`,
    });
    return json({ ok: true, id, paid: true, checkoutUrl: session.url });
  } catch (e) {
    return errorResponse(e);
  }
}
