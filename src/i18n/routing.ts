import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'pt', 'ko', 'de'],
  defaultLocale: 'en',
  // Inglés sin prefijo (/about); el resto con prefijo (/es/about)
  localePrefix: 'as-needed',
  // Detecta el idioma del navegador; si no es uno de los 5, usa inglés
  localeDetection: true,
});

export type SiteLocale = (typeof routing.locales)[number];
