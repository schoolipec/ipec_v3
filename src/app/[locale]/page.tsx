import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { isDatabaseUp } from '@/server/db';
import ThemeToggle from '@/components/site/ThemeToggle';

// Página temporal de la fase 1: comprueba idiomas, tema, Tailwind y base de datos. Se reemplaza en la fase 3.
export default async function SkeletonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Skeleton');
  const dbUp = await isDatabaseUp();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="flex w-full justify-end">
        <ThemeToggle label={t('toggleTheme')} />
      </div>

      <Image src="/assets/logo-transparent.png" alt="Iglesia Plenitud en Cristo" width={220} height={220} priority className="dark:hidden" />
      <Image src="/assets/logo-dark.png" alt="Iglesia Plenitud en Cristo" width={220} height={220} priority className="hidden dark:block" />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl">{t('title')}</h1>
        <p className="text-secondary">{t('subtitle')}</p>
      </div>

      <p
        data-testid="db-status"
        className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${dbUp ? 'bg-green' : 'bg-red-600'}`}
      >
        {dbUp ? t('dbOk') : t('dbDown')}
      </p>

      <nav aria-label={t('language')} className="flex flex-wrap justify-center gap-2">
        {routing.locales.map((l) => (
          <Link
            key={l}
            href="/"
            locale={l}
            className={`rounded-md border px-3 py-1 text-sm uppercase ${l === locale ? 'border-navy bg-navy text-white dark:border-lime dark:bg-lime dark:text-navy' : 'border-line text-primary hover:bg-alt'}`}
          >
            {l}
          </Link>
        ))}
      </nav>

      <div className="flex gap-3" aria-hidden="true">
        <span className="h-10 w-10 rounded-full bg-navy ring-1 ring-line" />
        <span className="h-10 w-10 rounded-full bg-green" />
        <span className="h-10 w-10 rounded-full bg-lime" />
        <span className="h-10 w-10 rounded-full bg-blue" />
      </div>
    </main>
  );
}
