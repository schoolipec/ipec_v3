import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/server/auth';

export async function GET(_req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    adminLocale: user.adminLocale,
    notifyTelegram: user.notifyTelegram,
    notifyEmail: user.notifyEmail,
    permissions: user.permissions,
  });
}
