// GET /api/config  - tells the join page whether membership is free or paid.
import { paidMode, storageReady, json } from './_lib/store.mjs';

export function GET() {
  return json({ paid: paidMode(), ready: storageReady() }, 200, { 'Cache-Control': 'public, s-maxage=60' });
}
