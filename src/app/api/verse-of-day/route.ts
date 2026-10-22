import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getVerseOfTheDay } from '@/server/verse-of-day';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? routing.defaultLocale;
  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json({ error: 'bad_locale' }, { status: 400 });
  }
  const verse = await getVerseOfTheDay(locale);
  if (!verse) return NextResponse.json({ error: 'no_verse' }, { status: 404 });
  return NextResponse.json(verse, { headers: { 'Cache-Control': 'private, max-age=600' } });
}
