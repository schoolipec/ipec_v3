import { getTranslations } from 'next-intl/server';

// Página provisional de la fase 2 para probar el menú; cada ruta se construye de verdad en la fase 3
export default async function PagePlaceholder({ titleKey }: { titleKey: 'about' | 'pastors' | 'contact' | 'live' }) {
  const tHeader = await getTranslations('Header');
  const t = await getTranslations('Placeholder');

  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-3xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold text-primary">{tHeader(titleKey)}</h1>
      <p className="text-secondary">{t('soon')}</p>
    </section>
  );
}
