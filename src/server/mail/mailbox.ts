import 'server-only';
import { ImapFlow } from 'imapflow';
import { simpleParser, type ParsedMail } from 'mailparser';
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import sanitizeHtml from 'sanitize-html';

const PAGE_SIZE = 20;

function config() {
  const host = (process.env.MAIL_HOST ?? '').trim();
  const user = (process.env.MAIL_USER ?? '').trim();
  const pass = process.env.MAIL_PASS ?? '';
  if (!host || !user || !pass) return null;
  return { host, user, pass };
}

export function isMailboxConfigured(): boolean {
  return config() !== null;
}

async function withImap<T>(fn: (client: ImapFlow) => Promise<T>): Promise<T> {
  const cfg = config();
  if (!cfg) throw new Error('mailbox_not_configured');
  const client = new ImapFlow({
    host: cfg.host,
    port: 993,
    secure: true,
    auth: { user: cfg.user, pass: cfg.pass },
    logger: false,
    socketTimeout: 20_000,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

async function folderPath(client: ImapFlow, special: '\\Sent' | '\\Trash'): Promise<string> {
  const boxes = await client.list();
  const found = boxes.find((b) => b.specialUse === special);
  if (found) return found.path;
  return special === '\\Sent' ? 'Sent' : 'Trash';
}

export type MailSummary = {
  uid: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  seen: boolean;
};

export async function listMail(folder: 'inbox' | 'sent', page: number) {
  return withImap(async (client) => {
    const path = folder === 'inbox' ? 'INBOX' : await folderPath(client, '\\Sent');
    const lock = await client.getMailboxLock(path);
    try {
      const all = (await client.search({ all: true }, { uid: true })) || [];
      const sorted = [...all].sort((a, b) => b - a);
      const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
      const slice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      const rows: MailSummary[] = [];
      if (slice.length > 0) {
        for await (const msg of client.fetch(slice.join(','), { uid: true, envelope: true, flags: true, internalDate: true }, { uid: true })) {
          rows.push({
            uid: msg.uid,
            from: msg.envelope?.from?.[0]?.address ?? '',
            to: (msg.envelope?.to ?? []).map((a) => a.address).join(', '),
            subject: msg.envelope?.subject ?? '(sin asunto)',
            date: new Date(msg.internalDate ?? Date.now()).toISOString(),
            seen: msg.flags?.has('\\Seen') ?? false,
          });
        }
      }
      rows.sort((a, b) => b.uid - a.uid);
      return { rows, page, pages, total: sorted.length };
    } finally {
      lock.release();
    }
  });
}

const DISPLAY_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'span', 'div', 'h1', 'h2', 'h3', 'h4'],
  allowedAttributes: { a: ['href', 'name', 'target', 'rel'], span: ['style'], p: ['style'], div: ['style'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedStyles: { '*': { color: [/^#[0-9a-fA-F]{3,6}$/], 'text-align': [/^(left|center|right|justify)$/] } },
  transformTags: { a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }) },
};

export type MailDetail = {
  uid: number;
  from: string;
  to: string;
  cc: string;
  subject: string;
  date: string;
  messageId: string;
  html: string;
  text: string;
  attachments: { index: number; filename: string; size: number; contentType: string }[];
};

export async function readMail(uid: number): Promise<MailDetail | null> {
  return withImap(async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(String(uid), { source: true, flags: true }, { uid: true });
      if (!msg || !msg.source) return null;
      await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
      const parsed: ParsedMail = await simpleParser(msg.source);
      return {
        uid,
        from: parsed.from?.value?.[0]?.address ?? '',
        to: parsed.to && !Array.isArray(parsed.to) ? parsed.to.text : '',
        cc: parsed.cc && !Array.isArray(parsed.cc) ? parsed.cc.text : '',
        subject: parsed.subject ?? '(sin asunto)',
        date: (parsed.date ?? new Date()).toISOString(),
        messageId: parsed.messageId ?? '',
        html: parsed.html ? sanitizeHtml(parsed.html, DISPLAY_OPTIONS) : '',
        text: parsed.text ?? '',
        attachments: parsed.attachments.map((a, index) => ({
          index,
          filename: a.filename ?? `adjunto-${index + 1}`,
          size: a.size,
          contentType: a.contentType,
        })),
      };
    } finally {
      lock.release();
    }
  });
}

export async function getAttachment(uid: number, index: number) {
  return withImap(async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(String(uid), { source: true }, { uid: true });
      if (!msg || !msg.source) return null;
      const parsed = await simpleParser(msg.source);
      const att = parsed.attachments[index];
      if (!att) return null;
      return { content: att.content, filename: att.filename ?? 'adjunto', contentType: att.contentType };
    } finally {
      lock.release();
    }
  });
}

export async function deleteMail(uid: number) {
  return withImap(async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const trash = await folderPath(client, '\\Trash');
      await client.messageMove(String(uid), trash, { uid: true });
    } finally {
      lock.release();
    }
  });
}

export type OutgoingMail = {
  to: string;
  subject: string;
  text: string;
  inReplyTo?: { messageId: string; references?: string };
};

export async function sendMail(mail: OutgoingMail) {
  const cfg = config();
  if (!cfg) throw new Error('mailbox_not_configured');
  const headers: Record<string, string> = {};
  if (mail.inReplyTo?.messageId) {
    headers['In-Reply-To'] = mail.inReplyTo.messageId;
    headers['References'] = [mail.inReplyTo.references, mail.inReplyTo.messageId].filter(Boolean).join(' ');
  }
  const options = { from: cfg.user, to: mail.to, subject: mail.subject, text: mail.text, headers };

  // El nombre se valida contra el certificado; la conexión puede ir a una IP fija (MAIL_SMTP_HOST) si el DNS interno no resuelve bien
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST?.trim() || cfg.host,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { servername: cfg.host },
  });
  await transporter.sendMail(options);

  // Copia en Enviados (SMTP no la guarda sola)
  const raw = await new MailComposer({ ...options, date: new Date() }).compile().build();
  await withImap(async (client) => {
    const sent = await folderPath(client, '\\Sent');
    await client.append(sent, raw, ['\\Seen']);
  });
}
