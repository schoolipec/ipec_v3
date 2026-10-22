import { prisma } from '@/server/db';

// Zona horaria de la iglesia: el versículo cambia según el día en Los Ángeles, no en el dispositivo del visitante
const CHURCH_TIME_ZONE = 'America/Los_Angeles';

export type VerseOfTheDay = { text: string; ref: string; locale: string; translation: string };

type VerseKey = { book: number; chapter: number; verse: number };

const refKey = (r: VerseKey) => `${r.book}-${r.chapter}-${r.verse}`;

// Día del mes (1-31) según la fecha de Los Ángeles
export function churchDayOfMonth(now: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: CHURCH_TIME_ZONE, day: 'numeric' }).format(now));
}

// Versículo del día en el idioma pedido. Si no existe en ese idioma, usa inglés (regla de Juan).
// Las referencias salen del inglés, que siempre está completo; así cada día muestra el mismo versículo en todos los idiomas.
export async function getVerseOfTheDay(locale: string, now: Date = new Date()): Promise<VerseOfTheDay | null> {
  const rows = await prisma.bibleVerse.findMany({
    where: { locale: { in: [locale, 'en'] } },
    select: { book: true, chapter: true, verse: true, locale: true, translation: true, reference: true, text: true },
  });

  const english = rows
    .filter((r) => r.locale === 'en')
    .sort((a, b) => a.book - b.book || a.chapter - b.chapter || a.verse - b.verse);
  if (english.length === 0) return null;

  const pick = english[(churchDayOfMonth(now) - 1) % english.length];
  const localized = rows.find((r) => r.locale === locale && refKey(r) === refKey(pick));
  const row = localized ?? pick;

  return { text: row.text, ref: row.reference, locale: row.locale, translation: row.translation };
}
