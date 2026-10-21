import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, clearSessionCookie, SESSION_COOKIE } from '@/server/auth';
import { cookies } from 'next/headers';

export async function POST(_req: NextRequest) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
