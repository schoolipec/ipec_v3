import { NextRequest, NextResponse } from 'next/server';
import { getSession, createInvitation } from '@/server/auth';
import type { Role } from '@prisma/client';
import { invitationMail, ROLE_LABELS, type MailLocale } from '@/server/mail/templates';
import { sendMail } from '@/server/mail/send';

export async function POST(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { email, name, role, locale } = await req.json();
  if (!email || !name || !role) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // ADMIN no puede crear SUPERADMIN
  if (role === 'SUPERADMIN' && actor.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Idioma del correo elegido en el panel; inglés por defecto
  const lang: MailLocale = locale === 'es' ? 'es' : 'en';
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanName = String(name).trim();
  // Antes de crear nada: un correo mal escrito (o en el campo de nombre) no debe generar una invitación
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const token = await createInvitation(cleanEmail, cleanName, role as Role, actor.email);

  const base = (process.env.APP_PUBLIC_URL ?? req.nextUrl.origin).replace(/\/$/, '');
  const link = `${base}/admin/invite/${token}`;
  const mail = invitationMail({
    name: cleanName,
    roleLabel: ROLE_LABELS[lang][role as 'SUPERADMIN' | 'ADMIN' | 'USER'],
    acceptUrl: link,
    lang,
  });
  const result = await sendMail(cleanEmail, mail);
  return NextResponse.json({ ok: true, link, emailSent: result.sent, emailReason: result.reason });
}
