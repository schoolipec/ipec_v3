import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { getAttachment } from '@/server/mail/mailbox';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string; index: string }> }) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { uid, index } = await params;
  const u = Number(uid);
  const i = Number(index);
  if (!Number.isInteger(u) || u <= 0 || !Number.isInteger(i) || i < 0) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    const att = await getAttachment(u, i);
    if (!att) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const safeName = att.filename.replace(/[^\w.\- ]/g, '_');
    return new NextResponse(new Uint8Array(att.content), {
      headers: {
        'Content-Type': att.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[mail] adjunto falló', err);
    return NextResponse.json({ error: 'mail_server_error' }, { status: 502 });
  }
}
