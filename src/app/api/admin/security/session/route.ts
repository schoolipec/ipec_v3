import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';

// PATCH /api/admin/security/session  → actualizar sessionTimeout
export async function PATCH(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { sessionTimeout } = await req.json() as { sessionTimeout: number };
  if (typeof sessionTimeout !== 'number' || sessionTimeout < 0) {
    return NextResponse.json({ error: 'invalid_value' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { sessionTimeout },
  });

  return NextResponse.json({ ok: true });
}
