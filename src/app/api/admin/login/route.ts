import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/server/users';
import { verifyPassword, createSession, setSessionCookie, upgradeHashIfNeeded } from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    const user = await getUserByEmail(String(email).toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const ok = await verifyPassword(String(password), user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    // Si el hash es del seed (scrypt nativo), lo actualiza silenciosamente a bcryptjs
    await upgradeHashIfNeeded(user.id, String(password), user.passwordHash);

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, adminLocale: user.adminLocale },
    });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
