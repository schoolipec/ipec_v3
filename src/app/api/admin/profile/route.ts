import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword, verifyPassword } from '@/server/auth';
import { updateUserProfile, getUserByEmail, type ContactFields } from '@/server/users';

const clean = (v: unknown, max: number) => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim().slice(0, max);
  return t === '' ? null : t;
};

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await req.json();
  const updates: Parameters<typeof updateUserProfile>[1] = {};

  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim().slice(0, 100);

  const contact: ContactFields = {};
  const phone = clean(body.phone, 30); if (phone !== undefined) contact.phone = phone;
  const whatsapp = clean(body.whatsapp, 30); if (whatsapp !== undefined) contact.whatsapp = whatsapp;
  const telegramChatId = clean(body.telegramChatId, 40); if (telegramChatId !== undefined) contact.telegramChatId = telegramChatId;
  if (typeof body.notifyTelegram === 'boolean') contact.notifyTelegram = body.notifyTelegram;
  if (typeof body.notifyEmail === 'boolean') contact.notifyEmail = body.notifyEmail;
  Object.assign(updates, contact);

  // Cambio de correo: exige la contraseña actual
  if (body.email) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: 'password_required' }, { status: 400 });
    }
    const ok = await verifyPassword(String(body.currentPassword), user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
    const newEmail = String(body.email).toLowerCase().trim();
    const existing = await getUserByEmail(newEmail);
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    }
    updates.email = newEmail;
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
