import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth';
import { listUsers, deleteUser, updateUserPermissions } from '@/server/users';
import type { Permissions } from '@/server/auth';

export async function GET(_req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const users = await listUsers();
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN' && actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { userId, permissions } = await req.json();
  if (!userId || !permissions) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  await updateUserPermissions(String(userId), permissions as Permissions);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const actor = await getSession();
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  if (userId === actor.id) {
    return NextResponse.json({ error: 'cannot_delete_self' }, { status: 400 });
  }

  await deleteUser(String(userId));
  return NextResponse.json({ ok: true });
}
