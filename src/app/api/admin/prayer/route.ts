import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'));
  const skip = (page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.prayerRequest.count(),
  ]);

  return NextResponse.json({ rows, total, page, pages: Math.ceil(total / PAGE_SIZE) });
}
