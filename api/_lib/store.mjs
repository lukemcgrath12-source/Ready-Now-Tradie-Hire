// Member storage, validation and helpers shared by the /api functions.
//
// Storage: Vercel Blob.
//  - Every member record lives in ONE private JSON blob (members/members.json).
//    Writes use optimistic concurrency: read with etag, write with ifMatch, retry.
//  - Photos: if BLOB_PUBLIC_READ_WRITE_TOKEN is set (token for a separate PUBLIC
//    Blob store) photos are stored there as public blobs and linked directly.
//    Otherwise they go in the main private store and are served through
//    /api/photo with long CDN caching. Vercel Blob stores are either public or
//    private as a whole, so the member JSON (which holds emails) must sit in a
//    private store.
import { get, put, del, BlobPreconditionFailedError } from '@vercel/blob';
import { randomBytes } from 'node:crypto';

export const DATA_PATH = 'members/members.json';
export const PHOTO_PREFIX = 'members/photos/';
export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
export const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const TRADES = [
  'Builders', 'Carpenters', 'Electricians', 'Plumbers', 'Roofers', 'Concreters', 'Tilers',
  'Painters', 'Plasterers', 'Bricklayers', 'Landscapers', 'Labourers', 'Traffic Control', 'Other',
];

export const LIMITS = { name: 60, business: 80, area: 60, bio: 400, email: 120 };

// ---------- responses ----------
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export class StorageNotReady extends Error {}
export class UserError extends Error {
  constructor(message, field) { super(message); this.field = field; }
}

export function storageReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}
export function requireStorage() {
  if (!storageReady()) {
    throw new StorageNotReady(
      'Member storage is not set up yet. Create a Vercel Blob store (private) for this project so BLOB_READ_WRITE_TOKEN is added, then redeploy.'
    );
  }
}

export function errorResponse(e) {
  if (e instanceof StorageNotReady) return json({ error: e.message, code: 'storage_not_ready' }, 503);
  if (e instanceof UserError) return json({ error: e.message, field: e.field || null }, 400);
  const msg = String((e && e.message) || e);
  if (/private/i.test(msg) && /access|store/i.test(msg)) {
    return json({ error: 'The Blob store must be a PRIVATE store for member data. ' + msg, code: 'store_access' }, 500);
  }
  console.error(e);
  return json({ error: 'Something went wrong on our end. Please try again or call 0432 910 369.' }, 500);
}

// ---------- doc load/save ----------
const EMPTY = () => ({ members: [], updatedAt: null });

export async function loadDoc() {
  requireStorage();
  const r = await get(DATA_PATH, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return { doc: EMPTY(), etag: null };
  const text = await new Response(r.stream).text();
  let doc;
  try { doc = JSON.parse(text); } catch { doc = EMPTY(); }
  if (!doc || !Array.isArray(doc.members)) doc = EMPTY();
  return { doc, etag: r.blob.etag };
}

// mutate(doc) changes the doc in place and returns a result value.
// Throwing a UserError inside mutate aborts without writing.
export async function updateDoc(mutate) {
  requireStorage();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { doc, etag } = await loadDoc();
    const result = await mutate(doc);
    doc.updatedAt = new Date().toISOString();
    try {
      await put(DATA_PATH, JSON.stringify(doc), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        cacheControlMaxAge: 60,
        ...(etag ? { ifMatch: etag, allowOverwrite: true } : { allowOverwrite: false }),
      });
      return result;
    } catch (e) {
      const raced = e instanceof BlobPreconditionFailedError || (!etag && /exist/i.test(String(e && e.message)));
      if (raced) { await sleep(80 + Math.random() * 200); continue; }
      throw e;
    }
  }
  throw new Error('Storage busy, please try again.');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- views ----------
export function publicView(m) {
  return {
    id: m.id,
    name: m.name,
    trade: m.trade,
    area: m.area,
    phone: m.phone,
    tel: m.tel,
    bio: m.bio,
    business: m.business || '',
    abn: m.abn || '',
    photo: m.photo || '',
    joined: m.createdAt,
  };
}
export const isVisible = (m) => m && m.status === 'active' && !m.hidden;

// ---------- validation ----------
export function clean(v, max, { multiline = false } = {}) {
  let s = typeof v === 'string' ? v : '';
  s = s.normalize('NFC').replace(/\r\n?/g, '\n');
  s = s.replace(/[<>]/g, ''); // never needed in a profile; keeps emails/admin views clean
  // strip control chars except newline
  s = s.replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, '');
  if (multiline) {
    s = s.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n');
  } else {
    s = s.replace(/\s+/g, ' ');
  }
  s = s.trim();
  if (max && s.length > max) s = s.slice(0, max);
  return s;
}

// Australian phone numbers: mobiles, landlines, 13/1300/1800.
export function normalisePhone(raw) {
  const s = String(raw || '').replace(/[\s().-]/g, '');
  let d = s;
  if (d.startsWith('+61')) d = '0' + d.slice(3);
  else if (d.startsWith('0061')) d = '0' + d.slice(4);
  else if (d.startsWith('61') && d.length === 11) d = '0' + d.slice(2);
  if (!/^\d+$/.test(d)) return null;
  if (/^0[45]\d{8}$/.test(d)) return { display: `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`, tel: '+61' + d.slice(1) };
  if (/^0[2378]\d{8}$/.test(d)) return { display: `(${d.slice(0, 2)}) ${d.slice(2, 6)} ${d.slice(6)}`, tel: '+61' + d.slice(1) };
  if (/^1[38]00\d{6}$/.test(d)) return { display: `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`, tel: d };
  if (/^13\d{4}$/.test(d)) return { display: `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4)}`, tel: d };
  return null;
}

export function normaliseAbn(raw) {
  const d = String(raw || '').replace(/\s/g, '');
  if (!d) return '';
  if (!/^\d{11}$/.test(d)) return null;
  const w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const n = d.split('').map(Number); n[0] -= 1;
  const sum = n.reduce((a, x, i) => a + x * w[i], 0);
  if (sum % 89 !== 0) return null;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|io|xyz|ru)\b)/i;

// Validates member fields. `partial` lets admin edits skip untouched fields.
export function validateMember(input, { partial = false, admin = false } = {}) {
  const out = {};
  const has = (k) => !partial || Object.prototype.hasOwnProperty.call(input, k);

  if (has('name')) {
    const name = clean(input.name, LIMITS.name);
    if (name.length < 2) throw new UserError('Add your name.', 'name');
    if (!/\p{L}/u.test(name)) throw new UserError('Name needs some letters in it.', 'name');
    out.name = name;
  }
  if (has('trade')) {
    const trade = clean(input.trade, 40);
    if (!TRADES.includes(trade)) throw new UserError('Pick your trade from the list.', 'trade');
    out.trade = trade;
  }
  if (has('area')) {
    const area = clean(input.area, LIMITS.area);
    if (area.length < 2) throw new UserError('Add the suburb or area you work in.', 'area');
    out.area = area;
  }
  if (has('phone')) {
    const p = normalisePhone(input.phone);
    if (!p) throw new UserError('Use an Australian phone number, like 0412 345 678.', 'phone');
    out.phone = p.display; out.tel = p.tel;
  }
  if (has('bio')) {
    const bio = clean(input.bio, LIMITS.bio, { multiline: true });
    if (!admin && bio.length < 20) throw new UserError('Write a couple of lines about your work (20 characters or more).', 'bio');
    if (!admin && LINK_RE.test(bio)) throw new UserError('Leave links out of your bio. Your phone number is already on your profile.', 'bio');
    out.bio = bio;
  }
  if (has('business')) out.business = clean(input.business, LIMITS.business);
  if (has('abn')) {
    const abn = normaliseAbn(input.abn);
    if (abn === null) throw new UserError('That ABN does not look right. Check the 11 digits or leave it blank.', 'abn');
    out.abn = abn;
  }
  if (has('email')) {
    const email = clean(input.email, LIMITS.email).toLowerCase();
    if (!admin && !EMAIL_RE.test(email)) throw new UserError('Add an email so we can reach you about your profile.', 'email');
    if (admin && email && !EMAIL_RE.test(email)) throw new UserError('That email does not look right.', 'email');
    out.email = email;
  }
  return out;
}

// ---------- photos ----------
function sniffType(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export async function readPhoto(file) {
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function' || !file.size) {
    throw new UserError('Add a profile photo.', 'photo');
  }
  if (file.size > MAX_PHOTO_BYTES) throw new UserError('That photo is too big. Use one under 1.5MB.', 'photo');
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniffType(buf);
  if (!type || !PHOTO_TYPES[type]) throw new UserError('Photo must be a JPG, PNG or WebP image.', 'photo');
  return { buf, type };
}

export async function savePhoto(memberId, { buf, type }) {
  requireStorage();
  const pathname = `${PHOTO_PREFIX}${memberId}-${randomBytes(5).toString('hex')}.${PHOTO_TYPES[type]}`;
  const publicToken = process.env.BLOB_PUBLIC_READ_WRITE_TOKEN;
  if (publicToken) {
    const blob = await put(pathname, buf, {
      access: 'public', token: publicToken, contentType: type, addRandomSuffix: false, cacheControlMaxAge: 31536000,
    });
    return { url: blob.url, pathname, store: 'public' };
  }
  await put(pathname, buf, { access: 'private', contentType: type, addRandomSuffix: false, cacheControlMaxAge: 31536000 });
  return { url: '/api/photo?p=' + encodeURIComponent(pathname), pathname, store: 'private' };
}

export async function deletePhoto(member) {
  if (!member || !member.photoPath) return;
  try {
    if (member.photoStore === 'public' && process.env.BLOB_PUBLIC_READ_WRITE_TOKEN) {
      await del(member.photo, { token: process.env.BLOB_PUBLIC_READ_WRITE_TOKEN });
    } else {
      await del(member.photoPath);
    }
  } catch (e) { console.warn('photo delete failed', e && e.message); }
}

// ---------- misc ----------
export const newId = () => randomBytes(6).toString('base64url');

export function clientIp(request) {
  const xf = request.headers.get('x-forwarded-for') || '';
  return (xf.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
}

// Cheap in-memory rate limit. Per function instance only, so it slows abuse
// rather than stopping it outright.
const hits = new Map();
export function rateLimited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k);
  return false;
}

export function paidMode() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && String(process.env.MEMBERSHIP_PAID).toLowerCase() === 'true'
  );
}

export async function getStripe() {
  const { default: Stripe } = await import('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
