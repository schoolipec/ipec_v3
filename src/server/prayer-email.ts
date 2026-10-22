import 'server-only';
import { formatReceivedDate } from '@/server/prayer-quelea-pdf';

const NAVY = '#082942';
const GREEN = '#3a8724';
const BACKGROUND = '#f7fcfe';

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function publicUrl(path: string): string {
  return `${(process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '')}${path}`;
}

// Mismo diseño que la presentación Quelea: bandas de ondas arriba y abajo, texto centrado, logo a la izquierda y fecha a la derecha
export function prayerEmailHtml(input: { name: string; message: string; createdAt: string }): string {
  const name = escapeHtml(input.name);
  const message = escapeHtml(input.message).replaceAll('\n', '<br>');
  const date = escapeHtml(formatReceivedDate(input.createdAt));
  const top = escapeHtml(publicUrl('/assets/brand/quelea-banda-superior.jpg'));
  const bottom = escapeHtml(publicUrl('/assets/brand/quelea-banda-inferior.jpg'));
  const logo = escapeHtml(publicUrl('/assets/logo-transparent.png'));
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nueva petición de oración</title></head>
<body style="margin:0;padding:0;background:${BACKGROUND};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BACKGROUND};">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td><img src="${top}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"></td></tr>
  <tr><td style="padding:36px 32px 12px;text-align:center;color:${NAVY};">
    <p style="margin:0 0 6px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${GREEN};font-weight:bold;">Nueva petición de oración</p>
    <h1 style="margin:0;font-size:30px;line-height:1.25;">${name}</h1>
  </td></tr>
  <tr><td style="padding:12px 36px 28px;text-align:center;color:${NAVY};">
    <div style="height:3px;width:120px;background:${GREEN};margin:0 auto 18px;"></div>
    <p style="margin:0;font-size:18px;line-height:1.6;">${message}</p>
  </td></tr>
  <tr><td style="padding:12px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left" style="width:50%;"><img src="${logo}" alt="Iglesia Plenitud en Cristo" width="110" style="display:block;width:110px;height:auto;border:0;"></td>
      <td align="right" style="width:50%;font-size:13px;color:${NAVY};">${date}</td>
    </tr></table>
  </td></tr>
  <tr><td><img src="${bottom}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"></td></tr>
</table>
</td></tr></table></body></html>`;
}
