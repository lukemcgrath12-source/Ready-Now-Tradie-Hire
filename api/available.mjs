// GET  /api/available            -> { date, ids: [members who are ready now today] }
// POST /api/available {id, k, on} -> a tradie sets or clears today's status with their private key
import { json, errorResponse, UserError } from './_lib/store.mjs';
import { loadAvail, setAvail, sydneyToday, keyOk } from './_lib/availability.mjs';

export async function GET() {
  try {
    const d = await loadAvail(); const date = sydneyToday();
    const ids = Object.keys(d).filter((k) => d[k] === date);
    return json({ date, ids }, 200, { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request) {
  try {
    let body; try { body = await request.json(); } catch { throw new UserError('Bad request'); }
    const { id, k, on } = body || {};
    if (typeof id !== 'string' || id.length > 64 || !keyOk(id, k)) throw new UserError('That link is not valid. Ask Ready Now for a new one.');
    await setAvail(id, Boolean(on));
    return json({ ok: true, id, on: Boolean(on), date: sydneyToday() }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) { return errorResponse(e); }
}
