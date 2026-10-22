import { NextRequest, NextResponse } from 'next/server';
import { completePasswordReset } from '@/server/password-reset';
import { clientIp, isRateLimited } from '@/server/rateLimit';

export async function POST(req: NextRequest) {
  if (isRateLimited(`pwd-reset:${clientIp(req.headers)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
  }
  const { token, password } = await req.json().catch(() => ({ token: '', password: '' }));
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 });
  }
  const ok = await completePasswordReset(String(token ?? ''), password);
  if (!ok) return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
