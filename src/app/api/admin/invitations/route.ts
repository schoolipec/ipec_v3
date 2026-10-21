import { NextRequest, NextResponse } from 'next/server';
import { getSession, createInvitation } from '@/server/auth';
import type { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { email, name, role } = await req.json();
  if (!email || !name || !role) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // ADMIN no puede crear SUPERADMIN
  if (role === 'SUPERADMIN' && actor.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const token = await createInvitation(
    String(email).toLowerCase().trim(),
    String(name).trim(),
    role as Role,
    actor.email,
  );

  // En producción, esto se enviará por correo. Por ahora devuelve el enlace.
  const base = req.nextUrl.origin;
  const link = `${base}/admin/invite/${token}`;
  return NextResponse.json({ ok: true, link });
}
