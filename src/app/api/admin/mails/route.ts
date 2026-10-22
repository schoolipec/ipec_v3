import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { isMailboxConfigured, listMail, sendMail } from '@/server/mail/mailbox';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin() {
  const actor = await getSession();
  if (!actor) return { error: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }) };
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  if (!isMailboxConfigured()) return { error: NextResponse.json({ error: 'mailbox_not_configured' }, { status: 503 }) };
  return { actor };
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const folder = req.nextUrl.searchParams.get('folder') === 'sent' ? 'sent' : 'inbox';
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1') || 1);
  try {
    return NextResponse.json({ folder, ...(await listMail(folder, page)) });
  } catch (err) {
    console.error('[mail] listar falló', err);
    return NextResponse.json({ error: 'mail_server_error' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const body = await req.json().catch(() => ({}));
  const to = typeof body.to === 'string' ? body.to.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '';
  const text = typeof body.text === 'string' ? body.text.slice(0, 20000) : '';
  if (!EMAIL.test(to) || !subject || !text.trim()) {
    return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
  }
  const reply = body.inReplyTo && typeof body.inReplyTo.messageId === 'string'
    ? { messageId: body.inReplyTo.messageId.slice(0, 300), references: typeof body.inReplyTo.references === 'string' ? body.inReplyTo.references.slice(0, 2000) : undefined }
    : undefined;
  try {
    await sendMail({ to, subject, text, inReplyTo: reply });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[mail] enviar falló', err);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
}
