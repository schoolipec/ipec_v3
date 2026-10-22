import 'server-only';

const SITE_NAME = 'Iglesia Plenitud en Cristo';
const NAVY = '#082942';
const GREEN = '#3a8724';
const SOFT = '#eef6fa';

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function publicUrl(path: string): string {
  const base = (process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}${path}`;
}

export type InvitationMail = { subject: string; html: string; text: string };

export function invitationMail(input: { name: string; inviterName: string; roleLabel: string; acceptUrl: string }): InvitationMail {
  const name = escapeHtml(input.name);
  const inviter = escapeHtml(input.inviterName);
  const role = escapeHtml(input.roleLabel);
  const url = escapeHtml(input.acceptUrl);
  const subject = `Invitación al panel de ${SITE_NAME}`;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${SOFT};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cfe5ef;">
  <tr><td align="center" style="background:${NAVY};padding:28px 24px;">
    <img src="${escapeHtml(publicUrl('/assets/logo-white.png'))}" alt="${escapeHtml(SITE_NAME)}" width="150" style="display:block;width:150px;height:auto;border:0;">
  </td></tr>
  <tr><td style="padding:32px 36px;color:${NAVY};">
    <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;text-align:center;">Hola, ${name}</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${inviter} te invitó a colaborar en el panel administrativo de <strong>${escapeHtml(SITE_NAME)}</strong> con el rol de <strong>${role}</strong>.</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Para entrar, crea tu contraseña personal con el botón de abajo.</p>
    <p style="margin:0 0 28px;text-align:center;">
      <a href="${url}" style="display:inline-block;padding:14px 30px;border-radius:10px;background:${GREEN};color:#ffffff;font-weight:bold;font-size:16px;text-decoration:none;">Crear mi contraseña</a>
    </p>
    <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#46647a;">Si el botón no funciona, copia este enlace en tu navegador:<br><span style="word-break:break-all;">${url}</span></p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#46647a;">Este enlace vence en 72 horas y solo se puede usar una vez. Si ya venció, pide a un administrador que te envíe una nueva invitación.</p>
  </td></tr>
  <tr><td style="background:${SOFT};padding:16px 24px;font-size:12px;color:#46647a;text-align:center;">${escapeHtml(SITE_NAME)} · Este es un mensaje automático, no respondas a este correo.</td></tr>
</table>
</td></tr></table></body></html>`;

  const text = `Hola, ${input.name}\n\n${input.inviterName} te invitó a colaborar en el panel administrativo de ${SITE_NAME} con el rol de ${input.roleLabel}.\n\nCrea tu contraseña personal en este enlace (vence en 72 horas y solo se puede usar una vez):\n${input.acceptUrl}\n\n${SITE_NAME}`;

  return { subject, html, text };
}

export function passwordResetMail(input: { name: string; resetUrl: string }): InvitationMail {
  const name = escapeHtml(input.name);
  const url = escapeHtml(input.resetUrl);
  const subject = `Recuperar contraseña del panel de ${SITE_NAME}`;
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${SOFT};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SOFT};padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cfe5ef;">
  <tr><td align="center" style="background:${NAVY};padding:28px 24px;">
    <img src="${escapeHtml(publicUrl('/assets/logo-white.png'))}" alt="${escapeHtml(SITE_NAME)}" width="150" style="display:block;width:150px;height:auto;border:0;">
  </td></tr>
  <tr><td style="padding:32px 36px;color:${NAVY};">
    <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;text-align:center;">Hola, ${name}</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Recibimos una solicitud para cambiar la contraseña de tu cuenta del panel administrativo.</p>
    <p style="margin:0 0 28px;text-align:center;">
      <a href="${url}" style="display:inline-block;padding:14px 30px;border-radius:10px;background:${GREEN};color:#ffffff;font-weight:bold;font-size:16px;text-decoration:none;">Crear nueva contraseña</a>
    </p>
    <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#46647a;">Si el botón no funciona, copia este enlace en tu navegador:<br><span style="word-break:break-all;">${url}</span></p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#46647a;">Este enlace vence en 1 hora y solo se puede usar una vez. Si no pediste este cambio, ignora este correo: tu contraseña no cambiará.</p>
  </td></tr>
  <tr><td style="background:${SOFT};padding:16px 24px;font-size:12px;color:#46647a;text-align:center;">${escapeHtml(SITE_NAME)} · Este es un mensaje automático, no respondas a este correo.</td></tr>
</table>
</td></tr></table></body></html>`;
  const text = `Hola, ${input.name}\n\nRecibimos una solicitud para cambiar la contraseña de tu cuenta del panel administrativo.\n\nCrea una nueva contraseña en este enlace (vence en 1 hora y solo se puede usar una vez):\n${input.resetUrl}\n\nSi no pediste este cambio, ignora este correo.\n\n${SITE_NAME}`;
  return { subject, html, text };
}
