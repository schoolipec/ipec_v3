import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    sessionTimeout: user.sessionTimeout,
  });
}
