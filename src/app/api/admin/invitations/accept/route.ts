import { NextRequest, NextResponse } from 'next/server';
import {
  getInvitation, markInvitationUsed,
  createSession, setSessionCookie,
} from '@/server/auth';
import { createUserFromInvitation, getUserByEmail } from '@/server/users';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 });
  }

  const inv = await getInvitation(String(token));
  if (!inv) return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  if (inv.usedAt) return NextResponse.json({ error: 'already_used' }, { status: 400 });
  if (inv.expiresAt < new Date()) return NextResponse.json({ error: 'expired' }, { status: 400 });

  const existing = await getUserByEmail(inv.email);
  if (existing) return NextResponse.json({ error: 'email_taken' }, { status: 409 });

  const user = await createUserFromInvitation(inv.email, inv.name, inv.role, String(password));
  await markInvitationUsed(String(token));

  const sessionToken = await createSession(user.id);
  await setSessionCookie(sessionToken);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
