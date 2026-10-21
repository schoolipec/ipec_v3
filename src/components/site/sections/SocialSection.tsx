import { getTranslations } from 'next-intl/server';
import { SITE_INFO } from '../siteInfo';
import { INSTAGRAM_BUTTON, InstagramIcon, SectionLabel } from './ui';

export default async function SocialSection() {
  const t = await getTranslations('social');

  return (
    <section className="bg-section-alt py-16">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <SectionLabel>{t('label')}</SectionLabel>
        <h2 className="mb-3 text-2xl font-bold text-primary md:text-3xl">{t('title')}</h2>
        <p className="mb-8 text-secondary">{t('text')}</p>
        <a href={SITE_INFO.instagram} target="_blank" rel="noopener noreferrer" className={INSTAGRAM_BUTTON}>
          <InstagramIcon />
          {t('action')}
        </a>
      </div>
    </section>
  );
}
