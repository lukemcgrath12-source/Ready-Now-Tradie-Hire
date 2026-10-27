// Server-side re-check of the admin login (same credentials as middleware.js).
import { createHash, timingSafeEqual } from 'node:crypto';

const USERNAME = 'readynow';
const SALT = 'a5e212edbe34a4f3b0cd291e3d459de1';
const HASH = '5d3e95a413da793b31162c0470ca178ced4b2356e405acf80f86606765d80f05';

export function isAdmin(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  let decoded = '';
  try { decoded = Buffer.from(header.slice(6), 'base64').toString('utf8'); } catch { return false; }
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  const user = decoded.slice(0, i).trim().toLowerCase();
  const pwd = decoded.slice(i + 1);
  const got = createHash('sha256').update(SALT + pwd).digest();
  const want = Buffer.from(HASH, 'hex');
  const hashOk = got.length === want.length && timingSafeEqual(got, want);
  return hashOk && user === USERNAME;
}

export function unauthorised() {
  return new Response(JSON.stringify({ error: 'Login required' }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Basic realm="Ready Now Members Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}
