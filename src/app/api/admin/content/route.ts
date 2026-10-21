import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSession, canEdit } from '@/server/auth';
import { prisma } from '@/server/db';
import type { SiteSection } from '@/server/auth';

const CONTENT_TAG = 'site-content';

export async function GET(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const section = req.nextUrl.searchParams.get('section') as SiteSection | null;
  const locale = req.nextUrl.searchParams.get('locale');

  const where = {
    ...(section ? { section } : {}),
    ...(locale ? { locale } : {}),
  };

  const entries = await prisma.contentEntry.findMany({
    where,
    orderBy: [{ section: 'asc' }, { key: 'asc' }],
  });
  return NextResponse.json(entries);
}

export async function PATCH(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id, value } = await req.json();
  if (!id || value === undefined) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const entry = await prisma.contentEntry.findUnique({ where: { id: String(id) } });
  if (!entry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (!canEdit(actor, entry.section as SiteSection)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Guardar = publicado de inmediato + historial
  await prisma.$transaction([
    prisma.contentRevision.create({
      data: {
        entryId: entry.id,
        oldValue: entry.value,
        newValue: String(value),
        changedBy: actor.email,
      },
    }),
    prisma.contentEntry.update({
      where: { id: entry.id },
      data: { value: String(value), updatedBy: actor.email },
    }),
  ]);

  // Invalidar caché del sitio para que el cambio se vea en la siguiente visita
  revalidateTag(CONTENT_TAG, { expire: 0 } as never);

  return NextResponse.json({ ok: true });
}
