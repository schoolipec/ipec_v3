import 'server-only';
import { prisma } from './db';
import { hashPassword, type Permissions, SITE_SECTIONS } from './auth';
import type { Role } from '@prisma/client';

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUserFromInvitation(
  email: string,
  name: string,
  role: Role,
  plainPassword: string,
  invitedById?: string,
) {
  const passwordHash = await hashPassword(plainPassword);
  // USER arranca con todos los permisos en false; ADMIN/SUPERADMIN no los usan
  const permissions: Permissions =
    role === 'USER'
      ? Object.fromEntries(SITE_SECTIONS.map((s) => [s, false]))
      : {};
  return prisma.user.create({
    data: { email, name, passwordHash, role, permissions, invitedById },
  });
}

export async function updateUserPermissions(userId: string, permissions: Permissions) {
  return prisma.user.update({ where: { id: userId }, data: { permissions } });
}

export type ContactFields = {
  phone?: string | null;
  whatsapp?: string | null;
  telegramChatId?: string | null;
  notifyTelegram?: boolean;
  notifyEmail?: boolean;
};

export async function updateUserProfile(
  userId: string,
  data: ContactFields & { name?: string; email?: string; passwordHash?: string },
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function updateUserByAdmin(
  userId: string,
  data: ContactFields & { name?: string; email?: string; role?: Role },
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function listUsers(viewerRole: Role) {
  return prisma.user.findMany({
    where: viewerRole === 'SUPERADMIN' ? {} : { role: { not: 'SUPERADMIN' } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      phone: true,
      whatsapp: true,
      telegramChatId: true,
      notifyTelegram: true,
      notifyEmail: true,
      createdAt: true,
      invitedById: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function deleteUser(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

// Crea el superadmin inicial desde variables de entorno (solo si no existe ninguno)
export async function ensureSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? 'Super Admin';
  if (!email || !password) return;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return;

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role: 'SUPERADMIN',
      permissions: {},
    },
  });
  console.log(`[seed] superadmin creado: ${email}`);
}
