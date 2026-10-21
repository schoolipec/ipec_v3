import type { SiteLocale } from '@/i18n/routing';

// Cada idioma se muestra con su propio nombre y la bandera que lo representa
export const LOCALE_OPTIONS: { code: SiteLocale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '/flags/us.png' },
  { code: 'es', label: 'Español', flag: '/flags/mx.png' },
  { code: 'pt', label: 'Português', flag: '/flags/br.png' },
  { code: 'ko', label: '한국어', flag: '/flags/kr.png' },
  { code: 'de', label: 'Deutsch', flag: '/flags/de.png' },
];
