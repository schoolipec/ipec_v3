import { NextRequest, NextResponse } from 'next/server';
import type { PrayerStatus } from '@prisma/client';
import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';
import { PRAYER_STATUSES } from '@/server/prayer';
import { buildPrayerQueleaPdf } from '@/server/prayer-quelea-pdf';

const MAX_PAGES = 300;

export async function POST(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status = PRAYER_STATUSES.includes(body.status as PrayerStatus) ? (body.status as PrayerStatus) : undefined;
  const q = typeof body.q === 'string' && body.q.trim() ? body.q.trim().slice(0, 100) : undefined;
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const rows = await prisma.prayerRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: MAX_PAGES,
    select: { name: true, request: true, createdAt: true },
  });
  if (rows.length === 0) return NextResponse.json({ error: 'no_results' }, { status: 400 });

  const bytes = await buildPrayerQueleaPdf(
    rows.map((r) => ({ name: r.name, message: r.request, createdAt: r.createdAt.toISOString() })),
  );
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="peticiones-quelea-${stamp}.pdf"`,
    },
  });
}
