import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isDatabaseUp } from '@/server/db';

// Home provisional: comprueba BD e idioma mientras se construye la fase 2. El Home real llega en la fase 3.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Skeleton');
  const dbUp = await isDatabaseUp();

  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-3xl flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-primary sm:text-4xl">{t('title')}</h1>
      <p className="text-secondary">{t('subtitle')}</p>
      <p
        data-testid="db-status"
        className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${dbUp ? 'bg-green' : 'bg-red-600'}`}
      >
        {dbUp ? t('dbOk') : t('dbDown')}
      </p>
    </section>
  );
}
