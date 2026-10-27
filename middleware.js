// Login wall for the member admin page and its API.
// Only a salted SHA-256 hash of the password lives here, never the password itself.
// The admin API also re-checks the same credentials server-side (api/_lib/auth.mjs).
export const config = { matcher: ['/members-admin', '/members-admin.html', '/api/admin/:path*'] };

const USERNAME = 'readynow';
const SALT = 'a5e212edbe34a4f3b0cd291e3d459de1';
const HASH = '5d3e95a413da793b31162c0470ca178ced4b2356e405acf80f86606765d80f05';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function middleware(request) {
  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(':');
      const user = decoded.slice(0, i).trim().toLowerCase();
      const pwd = decoded.slice(i + 1);
      const ok = safeEqual(await sha256(SALT + pwd), HASH);
      if (ok && user === USERNAME) return; // allowed through
    } catch (e) {}
  }
  return new Response('Login required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Ready Now Members Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
