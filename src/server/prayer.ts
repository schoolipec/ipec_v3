import 'server-only';
import type { PrayerStatus } from '@prisma/client';
import { prisma } from './db';

export const PRAYER_MAX_CHARS = 500;
export const PRAYER_NAME_MAX = 100;
export const PRAYER_PAGE_SIZE = 15;
export const PRAYER_STATUSES: PrayerStatus[] = ['NEW', 'PRAYING', 'ANSWERED', 'ARCHIVED'];

export async function listPrayerRequests({ page, status, q }: { page: number; status?: PrayerStatus; q?: string }) {
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  };
  const [rows, total, counts] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PRAYER_PAGE_SIZE,
      take: PRAYER_PAGE_SIZE,
    }),
    prisma.prayerRequest.count({ where }),
    prisma.prayerRequest.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  const countByStatus = Object.fromEntries(PRAYER_STATUSES.map((s) => [s, 0])) as Record<PrayerStatus, number>;
  for (const c of counts) countByStatus[c.status] = c._count._all;
  return { rows, total, pages: Math.max(1, Math.ceil(total / PRAYER_PAGE_SIZE)), countByStatus };
}

export async function setPrayerStatus(id: string, status: PrayerStatus) {
  return prisma.prayerRequest.update({ where: { id }, data: { status } });
}

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
