import 'server-only';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

const LOCALES = ['en', 'es', 'pt', 'ko', 'de'];
const BOT_UA = /bot|crawl|spider|slurp|preview|headless|monitor|lighthouse/i;

export function isPageView(req: { method: string; nextUrl: { pathname: string }; headers: Headers }) {
  if (req.method !== 'GET') return false;
  if (req.headers.get('rsc') || req.headers.get('next-router-prefetch')) return false;
  if (!(req.headers.get('accept') ?? '').includes('text/html')) return false;
  if (/\.[a-z0-9]+$/i.test(req.nextUrl.pathname)) return false;
  return !BOT_UA.test(req.headers.get('user-agent') ?? '');
}

function deviceOf(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function countryOf(req: { headers: Headers }) {
  const fromCdn = req.headers.get('cf-ipcountry') ?? req.headers.get('x-vercel-ip-country');
  if (fromCdn && /^[A-Z]{2}$/.test(fromCdn) && fromCdn !== 'XX') return fromCdn;
  // Sin CDN delante no hay país confiable: se usa la región del idioma del navegador (ej. es-MX → MX)
  const region = (req.headers.get('accept-language') ?? '').split(',')[0].split('-')[1];
  return region && /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : null;
}

export async function recordVisit(req: { nextUrl: { pathname: string }; headers: Headers }) {
  const ua = req.headers.get('user-agent') ?? '';
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = createHash('sha256')
    .update(`${ip}|${ua}|${day}|${process.env.SESSION_SECRET ?? ''}`)
    .digest('hex');

  const firstSegment = req.nextUrl.pathname.split('/')[1];
  const locale = LOCALES.includes(firstSegment) ? firstSegment : 'en';

  await prisma.pageVisit.create({
    data: {
      path: req.nextUrl.pathname.slice(0, 200),
      locale,
      country: countryOf(req),
      device: deviceOf(ua),
      visitorHash,
    },
  });
}

export async function getVisitStats(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = { createdAt: { gte: since } };

  const [total, uniqueRows, byDay, paths, countries, locales, devices] = await Promise.all([
    prisma.pageVisit.count({ where }),
    prisma.$queryRaw<{ n: bigint }[]>(Prisma.sql`
      SELECT COUNT(DISTINCT "visitorHash")::bigint AS n FROM "PageVisit" WHERE "createdAt" >= ${since}`),
    prisma.$queryRaw<{ day: string; n: bigint }[]>(Prisma.sql`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')::date, 'YYYY-MM-DD') AS day,
             COUNT(*)::bigint AS n
      FROM "PageVisit" WHERE "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1`),
    prisma.pageVisit.groupBy({ by: ['path'], where, _count: { _all: true }, orderBy: { _count: { path: 'desc' } }, take: 8 }),
    prisma.pageVisit.groupBy({ by: ['country'], where, _count: { _all: true }, orderBy: { _count: { country: 'desc' } }, take: 8 }),
    prisma.pageVisit.groupBy({ by: ['locale'], where, _count: { _all: true }, orderBy: { _count: { locale: 'desc' } } }),
    prisma.pageVisit.groupBy({ by: ['device'], where, _count: { _all: true }, orderBy: { _count: { device: 'desc' } } }),
  ]);

  const counted = new Map(byDay.map((r) => [r.day, Number(r.n)]));
  const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' });
  const filledDays = Array.from({ length: days }, (_, i) => {
    const day = dayFormat.format(new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000));
    return { day, count: counted.get(day) ?? 0 };
  });

  return {
    days,
    total,
    unique: Number(uniqueRows[0]?.n ?? 0),
    byDay: filledDays,
    paths: paths.map((r) => ({ path: r.path, count: r._count._all })),
    countries: countries.map((r) => ({ country: r.country, count: r._count._all })),
    locales: locales.map((r) => ({ locale: r.locale, count: r._count._all })),
    devices: devices.map((r) => ({ device: r.device, count: r._count._all })),
  };
}
