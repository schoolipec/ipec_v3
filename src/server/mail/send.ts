import 'server-only';
import nodemailer from 'nodemailer';
import { getSmtpConfig } from './config';
import type { InvitationMail } from './templates';

export type SendResult = { sent: boolean; reason: 'sent' | 'smtp_not_configured' | 'smtp_send_failed' };

// Nunca informa un envío falso: sin SMTP o con error, devuelve el motivo
export async function sendMail(to: string, mail: InvitationMail): Promise<SendResult> {
  const config = getSmtpConfig();
  if (!config) return { sent: false, reason: 'smtp_not_configured' };
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      tls: config.tlsServername ? { servername: config.tlsServername } : undefined,
    });
    await transporter.sendMail({ from: config.from, to, subject: mail.subject, html: mail.html, text: mail.text });
    return { sent: true, reason: 'sent' };
  } catch (err) {
    console.error('[mail] no se pudo enviar', err);
    return { sent: false, reason: 'smtp_send_failed' };
  }
}
