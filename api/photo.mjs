// GET /api/photo?p=members/photos/<file>  - serves member photos from a private Blob store.
// Only used when no public photo store is configured (see api/_lib/store.mjs).
import { get } from '@vercel/blob';
import { PHOTO_PREFIX, storageReady } from './_lib/store.mjs';

const SAFE = /^members\/photos\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/;

export async function GET(request) {
  const p = new URL(request.url).searchParams.get('p') || '';
  if (!p.startsWith(PHOTO_PREFIX) || !SAFE.test(p)) return new Response('Not found', { status: 404 });
  if (!storageReady()) return new Response('Storage not set up', { status: 503 });
  try {
    const r = await get(p, { access: 'private' });
    if (!r || r.statusCode !== 200) return new Response('Not found', { status: 404 });
    return new Response(r.stream, {
      headers: {
        'Content-Type': r.blob.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}
