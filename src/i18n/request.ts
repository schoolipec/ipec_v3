import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { getSiteMessages } from '@/server/content';

// Los textos salen de la base de datos (editables desde el admin), no de los archivos JSON
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await getSiteMessages(locale),
  };
});
