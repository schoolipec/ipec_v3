import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';
import { TOTP } from 'otplib';

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { code } = await req.json() as { code: string };
  if (!code) return NextResponse.json({ error: 'code_required' }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.twoFactorSecret) {
    return NextResponse.json({ error: 'setup_required' }, { status: 400 });
  }

  const totp = new TOTP();
  const isValid = await totp.verify(code, { secret: dbUser.twoFactorSecret });
  if (!isValid) return NextResponse.json({ error: 'invalid_code' }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ ok: true });
}
