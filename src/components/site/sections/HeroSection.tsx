import { getTranslations } from 'next-intl/server';
import { getSiteInfo } from '../siteInfo';
import { Link } from '@/i18n/navigation';
import { BRAND_BUTTON } from './ui';

export default async function HeroSection() {
  const t = await getTranslations('hero');
  const site = await getSiteInfo();

  return (
    <section className="relative flex min-h-[88dvh] items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: `url(${site.heroImage})`, backgroundPosition: 'center top' }}
        aria-hidden="true"
      />
      {/* Velo azul para que el texto se lea; más profundo en oscuro */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,41,66,0.55)_0%,rgba(8,41,66,0.70)_50%,rgba(8,41,66,0.88)_100%)] dark:bg-[linear-gradient(to_bottom,rgba(6,24,46,0.72)_0%,rgba(6,24,46,0.85)_50%,rgba(6,24,46,0.95)_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-5 bg-[linear-gradient(90deg,#4fc3f7_0%,#81c784_100%)] bg-clip-text text-sm font-semibold tracking-widest text-transparent uppercase">
          {t('tagline')}
        </p>
        <h1 className="mb-6 text-4xl leading-tight font-bold text-white drop-shadow-lg md:text-6xl">{t('title')}</h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/85 drop-shadow">{t('description')}</p>
        <Link href="/contact" className={BRAND_BUTTON}>
          {t('prayerAction')}
        </Link>
      </div>

      <svg className="absolute right-0 bottom-0 left-0 w-full" viewBox="0 0 1440 80" fill="none" aria-hidden="true">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,45 L1440,80 L0,80 Z" fill="white" fillOpacity="0.06" />
        <path d="M0,60 C400,20 800,70 1200,45 C1320,37 1400,55 1440,65 L1440,80 L0,80 Z" fill="white" fillOpacity="0.04" />
      </svg>
    </section>
  );
}
