import {NextRequest, NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {ADMIN_SESSION_COOKIE, clearAdminSessionCookie} from '@/server/admin-auth';
import {prisma} from '@/server/db';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({where: {tokenHash: createHash('sha256').update(token).digest('hex')}});
  await clearAdminSessionCookie();
  return NextResponse.json({ok: true});
}
