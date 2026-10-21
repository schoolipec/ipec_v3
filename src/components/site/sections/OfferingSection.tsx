import { getTranslations } from 'next-intl/server';
import { SITE_INFO } from '../siteInfo';
import { BRAND_BUTTON, SectionLabel } from './ui';

export default async function OfferingSection() {
  const t = await getTranslations('offering');

  return (
    <section id="giving" className="bg-section-alt py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <SectionLabel>{t('label')}</SectionLabel>
        <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">{t('title')}</h2>
        <p className="mx-auto mb-3 max-w-lg leading-relaxed text-secondary">{t('text')}</p>
        <p className="mb-8 text-sm text-secondary/80">{t('notice')}</p>
        <a href={SITE_INFO.square} target="_blank" rel="noopener noreferrer" className={BRAND_BUTTON}>
          {t('action')}
        </a>
      </div>
    </section>
  );
}
