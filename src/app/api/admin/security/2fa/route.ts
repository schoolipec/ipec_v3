import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';

// DELETE /api/admin/security/2fa  → deshabilitar 2FA
export async function DELETE() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: null, twoFactorEnabled: false },
  });

  return NextResponse.json({ ok: true });
}
