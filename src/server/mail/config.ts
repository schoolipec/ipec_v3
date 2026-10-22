import 'server-only';

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  tlsServername: string;
};

const DEFAULT_FROM = 'no-reply@suplenitud.com';

// Nunca inventa valores: sin host, usuario y contraseña no se envía nada
export function getSmtpConfig(env: NodeJS.ProcessEnv = process.env): SmtpConfig | null {
  const host = (env.SMTP_HOST ?? '').trim();
  const user = (env.SMTP_USER ?? '').trim();
  const pass = env.SMTP_PASS ?? '';
  if (!host || !user || !pass) return null;
  const port = Number(env.SMTP_PORT ?? '587');
  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure: (env.SMTP_SECURE ?? 'false').toLowerCase() === 'true',
    user,
    pass,
    from: (env.SMTP_FROM ?? DEFAULT_FROM).trim() || DEFAULT_FROM,
    tlsServername: (env.SMTP_TLS_SERVERNAME ?? '').trim(),
  };
}
