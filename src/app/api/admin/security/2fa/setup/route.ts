import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';
import { TOTP, generateSecret } from 'otplib';

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const secret = generateSecret();
  const totp = new TOTP();
  const otpAuthUrl = totp.toURI({ issuer: 'IPEC Admin', label: user.email, secret });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret, twoFactorEnabled: false },
  });

  return NextResponse.json({ secret, otpAuthUrl });
}
