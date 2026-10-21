import { NextRequest, NextResponse } from 'next/server';
import type { PrayerStatus } from '@prisma/client';
import { getSession } from '@/server/auth';
import { listPrayerRequests, PRAYER_STATUSES } from '@/server/prayer';

export async function GET(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
  const statusParam = params.get('status');
  const status = PRAYER_STATUSES.includes(statusParam as PrayerStatus) ? (statusParam as PrayerStatus) : undefined;
  const q = (params.get('q') ?? '').trim().slice(0, 100) || undefined;

  return NextResponse.json({ page, status: status ?? null, ...(await listPrayerRequests({ page, status, q })) });
}
