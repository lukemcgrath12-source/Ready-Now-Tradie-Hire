// POST /api/admin/photo  - admin only. Multipart: id, photo. Replaces a member's photo.
import { isAdmin, unauthorised } from '../_lib/auth.mjs';
import { updateDoc, readPhoto, savePhoto, deletePhoto, json, errorResponse, UserError } from '../_lib/store.mjs';

export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  try {
    let form;
    try { form = await request.formData(); } catch { throw new UserError('Could not read the upload.'); }
    const id = String(form.get('id') || '');
    if (!id) throw new UserError('Missing member id');
    const photo = await readPhoto(form.get('photo'));
    const saved = await savePhoto(id, photo);
    let old = null;
    const member = await updateDoc((doc) => {
      const m = doc.members.find((x) => x.id === id);
      if (!m) throw new UserError('That member no longer exists. Refresh the page.');
      old = { photo: m.photo, photoPath: m.photoPath, photoStore: m.photoStore };
      Object.assign(m, { photo: saved.url, photoPath: saved.pathname, photoStore: saved.store, updatedAt: new Date().toISOString() });
      const { ip, ...rest } = m;
      return rest;
    });
    if (old) await deletePhoto(old);
    return json({ ok: true, member });
  } catch (e) {
    return errorResponse(e);
  }
}
