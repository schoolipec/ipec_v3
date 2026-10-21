import {NextRequest, NextResponse} from 'next/server';
import {createAdminSession, setAdminSessionCookie, verifyAdminLogin} from '@/server/admin-auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {email?: unknown; password?: unknown} | null;
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') return NextResponse.json({error: 'invalid'}, {status: 400});
  const user = await verifyAdminLogin(body.email, body.password);
  if (!user) return NextResponse.json({error: 'invalid_credentials'}, {status: 401});
  const {token, expiresAt} = await createAdminSession(user.id);
  await setAdminSessionCookie(token, expiresAt);
  return NextResponse.json({ok: true, user: {name: user.name, role: user.role}});
}
