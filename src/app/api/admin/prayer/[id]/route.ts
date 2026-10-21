import { NextRequest, NextResponse } from 'next/server';
import type { PrayerStatus } from '@prisma/client';
import { getSession } from '@/server/auth';
import { setPrayerStatus, PRAYER_STATUSES } from '@/server/prayer';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!PRAYER_STATUSES.includes(status as PrayerStatus)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  await setPrayerStatus(id, status as PrayerStatus);
  return NextResponse.json({ ok: true });
}
