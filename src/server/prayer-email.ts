import 'server-only';
import { formatReceivedDate } from '@/server/prayer-quelea-pdf';

const NAVY = '#082942';
const GREEN = '#3a8724';

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function publicUrl(path: string): string {
  return `${(process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '')}${path}`;
}

// Mismo diseño que la presentación Quelea: fondo, tarjeta centrada, logo a la izquierda y fecha a la derecha
export function prayerEmailHtml(input: { name: string; message: string; createdAt: string }): string {
  const name = escapeHtml(input.name);
  const message = escapeHtml(input.message).replaceAll('\n', '<br>');
  const date = escapeHtml(`Recibida el ${formatReceivedDate(input.createdAt)}`);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nueva petición de oración</title></head>
<body style="margin:0;padding:0;background:#c9e3ee;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#c9e3ee;background-image:url('${escapeHtml(publicUrl('/assets/brand/quelea-fondo.jpg'))}');background-size:cover;background-position:center;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
  <tr><td style="padding:36px 32px 12px;text-align:center;color:${NAVY};">
    <p style="margin:0 0 6px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${GREEN};font-weight:bold;">Nueva petición de oración</p>
    <h1 style="margin:0;font-size:30px;line-height:1.25;">${name}</h1>
  </td></tr>
  <tr><td style="padding:12px 36px 28px;text-align:center;color:${NAVY};">
    <div style="height:3px;width:120px;background:${GREEN};margin:0 auto 18px;"></div>
    <p style="margin:0;font-size:18px;line-height:1.6;">${message}</p>
  </td></tr>
  <tr><td style="padding:16px 24px;background:#f2f8fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left" style="width:50%;"><img src="${escapeHtml(publicUrl('/assets/logo-transparent.png'))}" alt="Iglesia Plenitud en Cristo" width="110" style="display:block;width:110px;height:auto;border:0;"></td>
      <td align="right" style="width:50%;font-size:13px;color:${NAVY};">${date}</td>
    </tr></table>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}
