import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { deleteMail, readMail } from '@/server/mail/mailbox';

async function requireAdmin() {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return null;
}

function parseUid(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const uid = parseUid((await params).uid);
  if (!uid) return NextResponse.json({ error: 'invalid_uid' }, { status: 400 });
  try {
    const mail = await readMail(uid);
    if (!mail) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(mail);
  } catch (err) {
    console.error('[mail] leer falló', err);
    return NextResponse.json({ error: 'mail_server_error' }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const uid = parseUid((await params).uid);
  if (!uid) return NextResponse.json({ error: 'invalid_uid' }, { status: 400 });
  try {
    await deleteMail(uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[mail] borrar falló', err);
    return NextResponse.json({ error: 'mail_server_error' }, { status: 502 });
  }
}
