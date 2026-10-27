// /api/admin/members  - admin only (basic auth checked here as well as in middleware.js).
// GET: every member with all fields.
// POST JSON { action: 'update' | 'hide' | 'unhide' | 'delete' | 'activate', id, fields? }
import { isAdmin, unauthorised } from '../_lib/auth.mjs';
import { loadDoc, updateDoc, validateMember, deletePhoto, json, errorResponse, UserError } from '../_lib/store.mjs';

const ADMIN_VIEW = (m) => {
  const { ip, ...rest } = m;
  return rest;
};

export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  try {
    const { doc } = await loadDoc();
    const members = doc.members.map(ADMIN_VIEW).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return json({ members, updatedAt: doc.updatedAt });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  try {
    let body;
    try { body = await request.json(); } catch { throw new UserError('Bad request'); }
    const { action, id } = body || {};
    if (!id || typeof id !== 'string') throw new UserError('Missing member id');

    let removed = null;
    const result = await updateDoc((doc) => {
      const i = doc.members.findIndex((m) => m.id === id);
      if (i < 0) throw new UserError('That member no longer exists. Refresh the page.');
      const m = doc.members[i];
      const now = new Date().toISOString();
      if (action === 'update') {
        const fields = validateMember(body.fields || {}, { partial: true, admin: true });
        Object.assign(m, fields, { updatedAt: now });
      } else if (action === 'hide' || action === 'unhide') {
        m.hidden = action === 'hide'; m.updatedAt = now;
      } else if (action === 'activate') {
        m.status = 'active'; m.updatedAt = now;
      } else if (action === 'delete') {
        removed = m; doc.members.splice(i, 1);
        return { deleted: true };
      } else {
        throw new UserError('Unknown action');
      }
      return { member: ADMIN_VIEW(m) };
    });
    if (removed) await deletePhoto(removed);
    return json({ ok: true, ...result });
  } catch (e) {
    return errorResponse(e);
  }
}
