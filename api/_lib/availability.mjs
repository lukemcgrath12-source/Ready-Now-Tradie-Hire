// "Ready now" availability: which tradies said they are free today.
// Stored as a small private blob { [memberId]: 'YYYY-MM-DD' } next to the member list.
// Tradies update their own status with a private link carrying an HMAC key, so no logins are needed.
import { get, put } from '@vercel/blob';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { requireStorage, UserError } from './store.mjs';

export const AVAIL_PATH = 'members/availability.json';

// Today's date in Sydney, as YYYY-MM-DD.
export function sydneyToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function secret() {
  const s = process.env.AVAILABILITY_SECRET || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID || '';
  if (!s) throw new UserError('Availability is not set up yet.');
  return s;
}
export function availKey(id) {
  return createHmac('sha256', secret()).update('avail:' + String(id)).digest('base64url').slice(0, 22);
}
export function keyOk(id, k) {
  if (!id || !k || typeof k !== 'string') return false;
  const want = Buffer.from(availKey(id)); const got = Buffer.from(k);
  return want.length === got.length && timingSafeEqual(want, got);
}

export async function loadAvail() {
  requireStorage();
  const r = await get(AVAIL_PATH, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return {};
  try { const d = JSON.parse(await new Response(r.stream).text()); return d && typeof d === 'object' ? d : {}; } catch { return {}; }
}
export async function setAvail(id, on) {
  const d = await loadAvail();
  const today = sydneyToday();
  for (const k of Object.keys(d)) if (d[k] !== today) delete d[k]; // keep it small
  if (on) d[id] = today; else delete d[id];
  await put(AVAIL_PATH, JSON.stringify(d), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  return d;
}
