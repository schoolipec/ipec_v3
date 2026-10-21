import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SITE_INFO } from '../siteInfo';
import { INSTAGRAM_BUTTON, InstagramIcon, SectionLabel } from './ui';

// Estructura de v2. Sin fotos reales de los pastores todavía: imagen genérica, editable desde el admin en la fase 4.
export default async function PastorsContent() {
  const t = await getTranslations('pastors');
  const milestones = [1, 2, 3, 4].map((n) => ({
    num: `0${n}`,
    title: t(`milestone${n}Title` as 'milestone1Title'),
    text: t(`milestone${n}Text` as 'milestone1Text'),
  }));
  const values = [t('value1'), t('value2'), t('value3'), t('value4')];

  return (
    <>
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionLabel>{t('story')}</SectionLabel>
          <h1 className="mb-6 text-4xl font-bold text-primary md:text-5xl">{t('heroTitle')}</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-secondary">{t('heroText')}</p>
        </div>
        <div className="mx-auto mt-10 max-w-4xl px-6">
          <Image src="/assets/placeholder-pastors.png" alt="" width={1536} height={1024} sizes="(min-width: 896px) 896px, 100vw" className="h-64 w-full rounded-2xl object-cover shadow-xl md:h-80" priority />
        </div>
      </section>

      <section className="bg-section-alt py-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-2 text-sm font-bold tracking-widest text-green uppercase dark:text-lime">{t('marioName')}</p>
          <h2 className="mb-6 text-3xl font-bold text-primary">{t('marioSubtitle')}</h2>
          <p className="mb-4 leading-relaxed text-secondary">{t('marioBio1')}</p>
          <p className="mb-6 leading-relaxed text-secondary">{t('marioBio2')}</p>
          <a href={SITE_INFO.ghti} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue hover:underline dark:text-sky-400">
            {t('ghtiLink')}
          </a>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <SectionLabel>{t('journeyLabel')}</SectionLabel>
          <h2 className="mb-10 text-2xl font-bold text-primary md:text-3xl">{t('journeyTitle')}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {milestones.map((m) => (
              <div key={m.num} className="rounded-xl border border-line bg-card/90 p-6">
                <span className="mb-2 block text-xs font-bold text-[#7CB342]">{m.num}</span>
                <h3 className="mb-2 text-lg font-bold text-primary">{m.title}</h3>
                <p className="text-sm leading-relaxed text-secondary">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-alt py-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-2 text-sm font-bold tracking-widest text-green uppercase dark:text-lime">{t('adrianaName')}</p>
          <h2 className="mb-6 text-3xl font-bold text-primary">{t('adrianaSubtitle')}</h2>
          <p className="mb-4 leading-relaxed text-secondary">{t('adrianaBio1')}</p>
          <p className="mb-8 leading-relaxed text-secondary">{t('adrianaBio2')}</p>
          <SectionLabel>{t('valuesLabel')}</SectionLabel>
          <ul className="mt-4 flex flex-col gap-3">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-3 text-sm text-secondary">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#7CB342]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionLabel>{t('ghtiLabel')}</SectionLabel>
          <h2 className="mb-4 text-2xl font-bold text-primary md:text-3xl">{t('ghtiTitle')}</h2>
          <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-secondary">{t('ghtiText')}</p>
          <a href={SITE_INFO.instagram} target="_blank" rel="noopener noreferrer" className={INSTAGRAM_BUTTON}>
            <InstagramIcon />
            {t('visitInstagram')}
          </a>
        </div>
      </section>
    </>
  );
}
