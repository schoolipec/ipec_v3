import 'server-only';

// Correos del panel: mismo fondo de ondas que el PDF y las peticiones, y la tarjeta del login
const SITE_NAME = 'Iglesia Plenitud en Cristo';
const LEADER_NAME = 'Pastor Mario Alsina';
const GREEN = '#16a34a';
const CARD_BG = 'linear-gradient(160deg,#082942 0%,#0d4a5c 55%,#136b66 100%)';
const CARD_FALLBACK = '#0d4a5c';
const TEXT = '#e8f4f8';
const MUTED = '#b9d4df';

export type MailLocale = 'en' | 'es';
export type InvitationMail = { subject: string; html: string; text: string };

export const ROLE_LABELS: Record<MailLocale, Record<'SUPERADMIN' | 'ADMIN' | 'USER', string>> = {
  en: { SUPERADMIN: 'Super Administrator', ADMIN: 'Administrator', USER: 'User' },
  es: { SUPERADMIN: 'Super administrador', ADMIN: 'Administrador', USER: 'Usuario' },
};

const COPY = {
  en: {
    invitationSubject: `Invitation to the admin panel of ${SITE_NAME}`,
    greeting: (name: string) => `Hi, ${name}`,
    invitation: (role: string) =>
      `${LEADER_NAME} invites you to collaborate on the administrative panel of ${SITE_NAME} as ${role}.`,
    createPassword: 'Create my password',
    copyLink: 'If the button does not work, copy this link into your browser:',
    invitationExpiry:
      'This link expires in 72 hours and can be used only once. If it has expired, ask an administrator for a new invitation.',
    resetSubject: `Reset your password for the admin panel of ${SITE_NAME}`,
    resetIntro: 'We received a request to change the password of your administrator account.',
    resetButton: 'Create new password',
    resetExpiry:
      'This link expires in 1 hour and can be used only once. If you did not ask for this change, ignore this email: your password will not change.',
    footer: 'Automatic message, please do not reply to this email.',
  },
  es: {
    invitationSubject: `Invitación al panel de ${SITE_NAME}`,
    greeting: (name: string) => `Hola, ${name}`,
    invitation: (role: string) =>
      `El ${LEADER_NAME} te invita a colaborar en el panel administrativo de ${SITE_NAME} con el rol de ${role}.`,
    createPassword: 'Crear mi contraseña',
    copyLink: 'Si el botón no funciona, copia este enlace en tu navegador:',
    invitationExpiry:
      'Este enlace vence en 72 horas y solo se puede usar una vez. Si ya venció, pide a un administrador que te envíe una nueva invitación.',
    resetSubject: `Recuperar contraseña del panel de ${SITE_NAME}`,
    resetIntro: 'Recibimos una solicitud para cambiar la contraseña de tu cuenta del panel administrativo.',
    resetButton: 'Crear nueva contraseña',
    resetExpiry:
      'Este enlace vence en 1 hora y solo se puede usar una vez. Si no pediste este cambio, ignora este correo: tu contraseña no cambiará.',
    footer: 'Este es un mensaje automático, no respondas a este correo.',
  },
} as const;

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function publicUrl(path: string): string {
  const base = (process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}${path}`;
}

// Estructura común: fondo de ondas a pantalla completa y tarjeta con el degradado del login
function layout(opts: { lang: MailLocale; title: string; heading: string; body: string; button: { label: string; url: string }; hint: string; note: string }): string {
  const { lang, title, heading, body, button, hint, note } = opts;
  const url = escapeHtml(button.url);
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#0b3a55 url('${escapeHtml(publicUrl('/assets/brand/fondo-quelea.jpg'))}') center / cover no-repeat;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b3a55 url('${escapeHtml(publicUrl('/assets/brand/fondo-quelea.jpg'))}') center / cover no-repeat;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${CARD_FALLBACK};background:${CARD_BG};border-radius:16px;border:1px solid rgba(163,230,53,0.4);">
  <tr><td align="center" style="padding:36px 24px 8px;">
    <img src="${escapeHtml(publicUrl('/assets/logo-white-login.png'))}" alt="${escapeHtml(SITE_NAME)}" width="300" style="display:block;width:300px;max-width:100%;height:auto;border:0;">
  </td></tr>
  <tr><td style="padding:12px 36px 32px;color:${TEXT};">
    <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;text-align:center;color:#ffffff;">${escapeHtml(heading)}</h1>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:${TEXT};">${body}</p>
    <p style="margin:0 0 26px;text-align:center;">
      <a href="${url}" style="display:inline-block;padding:14px 30px;border-radius:10px;background:${GREEN};color:#ffffff;font-weight:bold;font-size:16px;text-decoration:none;">${escapeHtml(button.label)}</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(hint)}<br><span style="word-break:break-all;">${url}</span></p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(note)}</p>
  </td></tr>
  <tr><td style="padding:14px 24px;font-size:12px;color:${MUTED};text-align:center;border-top:1px solid rgba(255,255,255,0.12);">${escapeHtml(SITE_NAME)} · ${escapeHtml(COPY[lang].footer)}</td></tr>
</table>
</td></tr></table></body></html>`;
}

export function invitationMail(input: { name: string; roleLabel: string; acceptUrl: string; lang?: MailLocale }): InvitationMail {
  const lang: MailLocale = input.lang === 'es' ? 'es' : 'en';
  const c = COPY[lang];
  const html = layout({
    lang,
    title: c.invitationSubject,
    heading: c.greeting(input.name),
    body: escapeHtml(c.invitation(input.roleLabel)),
    button: { label: c.createPassword, url: input.acceptUrl },
    hint: c.copyLink,
    note: c.invitationExpiry,
  });
  const text = `${c.greeting(input.name)}\n\n${c.invitation(input.roleLabel)}\n\n${input.acceptUrl}\n\n${c.invitationExpiry}\n\n${SITE_NAME}`;
  return { subject: c.invitationSubject, html, text };
}

export function passwordResetMail(input: { name: string; resetUrl: string; lang?: MailLocale }): InvitationMail {
  const lang: MailLocale = input.lang === 'es' ? 'es' : 'en';
  const c = COPY[lang];
  const html = layout({
    lang,
    title: c.resetSubject,
    heading: c.greeting(input.name),
    body: escapeHtml(c.resetIntro),
    button: { label: c.resetButton, url: input.resetUrl },
    hint: c.copyLink,
    note: c.resetExpiry,
  });
  const text = `${c.greeting(input.name)}\n\n${c.resetIntro}\n\n${input.resetUrl}\n\n${c.resetExpiry}\n\n${SITE_NAME}`;
  return { subject: c.resetSubject, html, text };
}
