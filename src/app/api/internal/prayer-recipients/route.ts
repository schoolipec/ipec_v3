import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/server/db';

function authorized(provided: string | null) {
  const expected = process.env.N8N_INTERNAL_TOKEN;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorized(req.headers.get('x-internal-token'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [telegram, email] = await Promise.all([
    prisma.user.findMany({
      where: { notifyTelegram: true, telegramChatId: { not: null } },
      select: { name: true, telegramChatId: true },
    }),
    prisma.user.findMany({
      where: { notifyEmail: true },
      select: { name: true, email: true },
    }),
  ]);

  return NextResponse.json({
    telegram: telegram.map((u) => ({ name: u.name, chatId: u.telegramChatId })),
    email: email.map((u) => ({ name: u.name, email: u.email })),
  });
}
