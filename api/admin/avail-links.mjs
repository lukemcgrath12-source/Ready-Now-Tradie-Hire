// GET /api/admin/avail-links?ids=a,b,c  - admin only. Private "I'm available today" links for tradies.
import { isAdmin, unauthorised } from '../_lib/auth.mjs';
import { json, errorResponse } from '../_lib/store.mjs';
import { availKey } from '../_lib/availability.mjs';

export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  try {
    const url = new URL(request.url);
    const ids = String(url.searchParams.get('ids') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 200);
    const links = {};
    for (const id of ids) links[id] = url.origin + '/available?id=' + encodeURIComponent(id) + '&k=' + availKey(id);
    return json({ links }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) { return errorResponse(e); }
}
