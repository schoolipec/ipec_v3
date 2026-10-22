import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSession, canEdit } from '@/server/auth';
import { prisma } from '@/server/db';
import { MAX_IMAGE_BYTES, sniffImageMime } from '@/server/media';
import { CONTENT_TAG } from '@/server/content';
import type { SiteSection } from '@/server/auth';

export async function POST(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const entryId = form?.get('entryId');
  if (!(file instanceof File) || typeof entryId !== 'string') {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'invalid_size' }, { status: 400 });
  }

  const entry = await prisma.contentEntry.findUnique({ where: { id: entryId } });
  if (!entry) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!canEdit(actor, entry.section as SiteSection)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffImageMime(bytes);
  if (!mimeType) return NextResponse.json({ error: 'invalid_type' }, { status: 400 });

  const asset = await prisma.mediaAsset.create({
    data: { mimeType, size: bytes.byteLength, data: Buffer.from(bytes), createdBy: actor.email },
  });
  const value = `/api/media/${asset.id}`;

  await prisma.$transaction([
    prisma.contentRevision.create({
      data: { entryId: entry.id, oldValue: entry.value, newValue: value, changedBy: actor.email },
    }),
    prisma.contentEntry.update({
      where: { id: entry.id },
      data: { value, updatedBy: actor.email },
    }),
  ]);

  revalidateTag(CONTENT_TAG, { expire: 0 } as never);
  return NextResponse.json({ ok: true, value });
}
