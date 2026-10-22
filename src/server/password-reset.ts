import 'server-only';
import { randomBytes } from 'crypto';
import { prisma } from './db';
import { hashPassword } from './auth';
import { getUserByEmail } from './users';
import { passwordResetMail, type MailLocale } from './mail/templates';
import { sendMail } from './mail/send';

const RESET_HOURS = 1;

// Siempre responde igual, exista o no la cuenta, para no revelar qué correos están registrados
export async function requestPasswordReset(email: string, lang: MailLocale = 'en'): Promise<void> {
  const user = await getUserByEmail(email.toLowerCase().trim());
  if (!user) return;
  const token = randomBytes(32).toString('hex');
  await prisma.passwordReset.deleteMany({ where: { userId: user.id, usedAt: null } });
  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + RESET_HOURS * 3_600_000) },
  });
  const base = (process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '');
  const mail = passwordResetMail({ name: user.name, resetUrl: `${base}/admin/reset/${token}`, lang });
  await sendMail(user.email, mail);
}

export async function findValidReset(token: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) return null;
  return reset;
}

export async function completePasswordReset(token: string, newPassword: string): Promise<boolean> {
  const reset = await findValidReset(token);
  if (!reset) return false;
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);
  return true;
}
