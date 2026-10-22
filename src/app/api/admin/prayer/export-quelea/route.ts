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
  const q = typeof body.q === 'string' && body.q.trim() ? body.q.trim().slice(0, 100) : undefined;
  const where = {
    status: 'NEW' as PrayerStatus,
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const rows = await prisma.prayerRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: MAX_PAGES,
    select: { id: true, name: true, request: true, createdAt: true },
  });
  if (rows.length === 0) return NextResponse.json({ error: 'no_results' }, { status: 400 });

  const bytes = await buildPrayerQueleaPdf(
    rows.map((r) => ({ name: r.name, message: r.request, createdAt: r.createdAt.toISOString() })),
  );
  await prisma.prayerRequest.updateMany({
    where: { id: { in: rows.map((r) => r.id) } },
    data: { status: 'DOWNLOADED' },
  });
  // Nombre: "Peticiones MM-DD-YYYY.pdf" con la fecha de Los Ángeles
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const filename = `Peticiones ${parts.month}-${parts.day}-${parts.year}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
