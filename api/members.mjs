// GET /api/members  - public list of live members (no emails, no admin fields).
import { loadDoc, publicView, isVisible, json, errorResponse } from './_lib/store.mjs';

export async function GET() {
  try {
    const { doc } = await loadDoc();
    const members = doc.members.filter(isVisible).map(publicView)
      .sort((a, b) => String(b.joined).localeCompare(String(a.joined)));
    return json({ members }, 200, { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=120' });
  } catch (e) {
    return errorResponse(e);
  }
}
