import { NextRequest, NextResponse } from 'next/server';
import { clientIp, isRateLimited } from '@/server/rateLimit';
import { parsePrayerInput, savePrayerRequest } from '@/server/prayer';

// 5 envíos cada 15 minutos por IP
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (isRateLimited(`prayer:${clientIp(req.headers)}`, MAX_PER_WINDOW, WINDOW_MS)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // Campo trampa invisible: solo los robots lo llenan. Se responde "ok" sin guardar nada.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true });
  }

  const input = parsePrayerInput(body);
  if (!input) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    await savePrayerRequest(input);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[prayer] no se pudo guardar', err);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
