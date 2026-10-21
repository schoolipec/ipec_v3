import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword, verifyPassword } from '@/server/auth';
import { updateUserProfile, getUserByEmail } from '@/server/users';

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await req.json();
  const updates: Parameters<typeof updateUserProfile>[1] = {};

  if (body.name) updates.name = String(body.name).trim().slice(0, 100);
  if (body.adminLocale && ['en', 'es'].includes(body.adminLocale)) {
    updates.adminLocale = body.adminLocale;
  }
  if (typeof body.notifyTelegram === 'boolean') updates.notifyTelegram = body.notifyTelegram;
  if (typeof body.notifyEmail === 'boolean') updates.notifyEmail = body.notifyEmail;

  // Cambio de correo: exige la contraseña actual
  if (body.email) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: 'password_required' }, { status: 400 });
    }
    const ok = await verifyPassword(String(body.currentPassword), user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
    const existing = await getUserByEmail(String(body.email).toLowerCase().trim());
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }
    updates.email = String(body.email).toLowerCase().trim();
  }

  // Cambio de contraseña: exige la contraseña actual
  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: 'password_required' }, { status: 400 });
    }
    const ok = await verifyPassword(String(body.currentPassword), user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
    if (String(body.newPassword).length < 8) {
      return NextResponse.json({ error: 'password_too_short' }, { status: 400 });
    }
    updates.passwordHash = await hashPassword(String(body.newPassword));
  }

  await updateUserProfile(user.id, updates);
  return NextResponse.json({ ok: true });
}
