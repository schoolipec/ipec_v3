import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@prisma/client';
import { getSession } from '@/server/auth';
import { getUserByEmail, updateUserByAdmin } from '@/server/users';
import { prisma } from '@/server/db';

const ROLES: Role[] = ['SUPERADMIN', 'ADMIN', 'USER'];
const clean = (v: unknown, max: number) => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim().slice(0, max);
  return t === '' ? null : t;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  // Un ADMIN no puede tocar cuentas SUPERADMIN ni otorgar ese rol
  if (actor.role === 'ADMIN' && target.role === 'SUPERADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const data: Parameters<typeof updateUserByAdmin>[1] = {};

  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim().slice(0, 100);
  if (typeof body.email === 'string' && body.email.trim()) {
    const email = body.email.toLowerCase().trim();
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== id) return NextResponse.json({ error: 'email_taken' }, { status: 409 });
    data.email = email;
  }
  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) return NextResponse.json({ error: 'invalid_role' }, { status: 400 });
    if (body.role === 'SUPERADMIN' && actor.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    if (id === actor.id && body.role !== actor.role) {
      return NextResponse.json({ error: 'cannot_change_own_role' }, { status: 400 });
    }
    data.role = body.role;
  }
  const phone = clean(body.phone, 30); if (phone !== undefined) data.phone = phone;
  const whatsapp = clean(body.whatsapp, 30); if (whatsapp !== undefined) data.whatsapp = whatsapp;
  const telegramChatId = clean(body.telegramChatId, 40); if (telegramChatId !== undefined) data.telegramChatId = telegramChatId;
  if (typeof body.notifyTelegram === 'boolean') data.notifyTelegram = body.notifyTelegram;
  if (typeof body.notifyEmail === 'boolean') data.notifyEmail = body.notifyEmail;

  await updateUserByAdmin(id, data);
  return NextResponse.json({ ok: true });
}
