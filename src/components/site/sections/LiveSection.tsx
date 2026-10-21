import { getTranslations } from 'next-intl/server';
import { SITE_INFO } from '../siteInfo';

// Igual que v2: no detecta transmisión real; muestra horarios y enlaces a YouTube y Facebook
export default async function LiveSection({ asPage = false }: { asPage?: boolean }) {
  const t = await getTranslations('live');
  const Title = asPage ? 'h1' : 'h2';

  return (
    <section id="live" className="bg-[#061828] py-20 transition-colors duration-300 dark:bg-[#030e1a]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="text-sm font-semibold tracking-widest text-red-400 uppercase">{t('status')}</span>
        </div>

        <Title className="mb-3 text-2xl font-bold text-white md:text-3xl">{t('title')}</Title>
        <p className="mx-auto mb-4 max-w-xl text-white/60">{t('text')}</p>
        <p className="mb-10 text-sm text-white/40">{t('schedule')}</p>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <svg className="h-8 w-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
            </svg>
          </div>
          <p className="text-sm text-white/60">{t('noLiveText')}</p>
        </div>

        <p className="mb-5 text-sm text-white/50">{t('watchOn')}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={SITE_INFO.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:border-red-500 hover:bg-red-500/10"
          >
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            {t('watchYoutube')}
          </a>
          <a
            href={SITE_INFO.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:border-blue-500 hover:bg-blue-500/10"
          >
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t('watchFacebook')}
          </a>
        </div>
      </div>
    </section>
  );
}
