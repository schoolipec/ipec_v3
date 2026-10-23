import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import type { User, Role } from '@prisma/client';

export const SESSION_COOKIE = 'ipec_session';
const SESSION_DAYS = 30;

// ── Contraseñas ───────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Hash creado por el seed con Node.js scrypt nativo (formato "scrypt:salt:hash")
  if (hash.startsWith('scrypt:')) {
    const { scryptSync, timingSafeEqual } = await import('crypto');
    const [, salt, stored] = hash.split(':');
    const derived = scryptSync(plain, salt, 64).toString('hex');
    try {
      return timingSafeEqual(Buffer.from(derived), Buffer.from(stored));
    } catch {
      return false;
    }
  }
  // Hash creado por bcryptjs (formato "$2b$...")
  return bcrypt.compare(plain, hash);
}

// Al primer login exitoso con hash scrypt, actualiza a bcryptjs para mayor seguridad
export async function upgradeHashIfNeeded(userId: string, plain: string, currentHash: string) {
  if (!currentHash.startsWith('scrypt:')) return;
  const newHash = await hashPassword(plain);
  await import('./db').then(m => m.prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  }));
}

// ── Sesiones ──────────────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.session.create({ data: { userId, token, expiresAt } });
  return token;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

// cache() = una sola consulta por petición. Layout y páginas se renderizan en paralelo;
// sin esto, cada uno intentaba borrar la sesión expirada a la vez y uno fallaba (P2025).
export const getSession = cache(async (): Promise<(User & { sessionId: string }) | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // deleteMany: no lanza error si la fila ya fue borrada por otra petición
    if (session) await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  // Verificar timeout por inactividad
  const { sessionTimeout } = session.user;
  if (sessionTimeout > 0) {
    const inactiveMs = Date.now() - session.lastActivityAt.getTime();
    if (inactiveMs > sessionTimeout * 60_000) {
      await prisma.session.deleteMany({ where: { id: session.id } });
      return null;
    }
  }

  // Actualizar lastActivityAt sin bloquear el render
  prisma.session.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date() },
  }).catch(() => {});

  return { ...session.user, sessionId: session.id };
});

export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

// ── Invitaciones ──────────────────────────────────────────────────────────────

const INVITE_HOURS = 72;

export async function createInvitation(
  email: string,
  name: string,
  role: Role,
  invitedBy: string,
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + INVITE_HOURS * 3_600_000);

  // Si ya hay una invitación pendiente para ese correo, la reemplaza
  await prisma.invitation.deleteMany({ where: { email, usedAt: null } });
  await prisma.invitation.create({ data: { email, name, role, token, expiresAt, invitedBy } });
  return token;
}

export async function getInvitation(token: string) {
  return prisma.invitation.findUnique({ where: { token } });
}

export async function markInvitationUsed(token: string) {
  await prisma.invitation.update({ where: { token }, data: { usedAt: new Date() } });
}

// ── Permisos ──────────────────────────────────────────────────────────────────

// Secciones editables del sitio (debe mantenerse en sync con las del seed)
export const SITE_SECTIONS = [
  'hero', 'about', 'groups', 'pastors', 'contact', 'live', 'offering', 'social',
] as const;
export type SiteSection = (typeof SITE_SECTIONS)[number];

export type Permissions = Partial<Record<SiteSection, boolean>>;

export function canEdit(user: User, section: SiteSection): boolean {
  if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') return true;
  const perms = user.permissions as Permissions;
  return perms[section] === true;
}

export function canView(user: User, section: SiteSection): boolean {
  return canEdit(user, section);
}
