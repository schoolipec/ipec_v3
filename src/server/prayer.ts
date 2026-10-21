import 'server-only';
import { prisma } from './db';

export const PRAYER_MAX_CHARS = 500;
export const PRAYER_NAME_MAX = 100;

type PrayerInput = { name: string; request: string; locale: string };

export function parsePrayerInput(body: unknown): PrayerInput | null {
  if (!body || typeof body !== 'object') return null;
  const { name, request, locale } = body as Record<string, unknown>;
  if (typeof name !== 'string' || typeof request !== 'string') return null;
  const cleanName = name.trim();
  const cleanRequest = request.trim();
  if (!cleanName || cleanName.length > PRAYER_NAME_MAX) return null;
  if (!cleanRequest || cleanRequest.length > PRAYER_MAX_CHARS) return null;
  return {
    name: cleanName,
    request: cleanRequest,
    locale: typeof locale === 'string' && /^[a-z]{2}$/.test(locale) ? locale : 'en',
  };
}

export async function savePrayerRequest(input: PrayerInput) {
  const saved = await prisma.prayerRequest.create({ data: input });
  // El aviso a n8n no bloquea la respuesta: si falla, el pedido ya quedó guardado en la BD
  void notifyN8n(saved).catch((err) => console.warn('[prayer] webhook n8n falló, id:', saved.id, err));
  return saved;
}

async function notifyN8n(saved: { id: string; name: string; request: string; locale: string; createdAt: Date }) {
  const url = process.env.N8N_PRAYER_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: saved.id,
      name: saved.name,
      request: saved.request,
      locale: saved.locale,
      timestamp: saved.createdAt.toISOString(),
      source: 'ipec-website',
    }),
    signal: AbortSignal.timeout(8000),
  });
}
