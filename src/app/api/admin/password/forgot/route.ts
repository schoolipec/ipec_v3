import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/server/password-reset';
import { clientIp, isRateLimited } from '@/server/rateLimit';

export async function POST(req: NextRequest) {
  if (isRateLimited(`pwd-forgot:${clientIp(req.headers)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
  }
  const { email } = await req.json().catch(() => ({ email: '' }));
  if (typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    await requestPasswordReset(email).catch((err) => console.error('[password] recuperación falló', err));
  }
  // Misma respuesta siempre: no revela si el correo existe
  return NextResponse.json({ ok: true });
}
