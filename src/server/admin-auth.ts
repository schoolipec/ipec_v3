import 'server-only';
import {createHash, randomBytes} from 'node:crypto';
import {cookies} from 'next/headers';
import {NextRequest} from 'next/server';
import bcrypt from 'bcryptjs';
import {prisma} from '@/server/db';
import {Role} from '@prisma/client';

export const ADMIN_SESSION_COOKIE = 'ipec_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

type AdminActor = {id: string; email: string; name: string; role: Role; permissions: unknown; adminLocale: string};

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({data: {userId, tokenHash: tokenHash(token), expiresAt}});
  return {token, expiresAt};
}

export async function setAdminSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: expiresAt});
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, '', {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: new Date(0)});
}

export async function getAdminActor(request?: NextRequest): Promise<AdminActor | null> {
  const rawToken = request?.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!rawToken) return null;
  const session = await prisma.session.findUnique({where: {tokenHash: tokenHash(rawToken)}, include: {user: true}});
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({where: {id: session.id}}).catch(() => undefined);
    return null;
  }
  const {user} = session;
  return {id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions, adminLocale: user.adminLocale};
}

export function canManageAdmin(actor: AdminActor | null) {
  return actor?.role === Role.SUPERADMIN || actor?.role === Role.ADMIN;
}

export async function verifyAdminLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({where: {email: email.trim().toLowerCase()}});
  if (!user || !(user.role === Role.SUPERADMIN || user.role === Role.ADMIN)) return null;
  return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}
