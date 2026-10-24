import { getTranslations } from 'next-intl/server';
import { getSiteInfo } from '../siteInfo';
import { getLiveVideo } from '@/server/youtube-live';

export default async function LiveSection({ asPage = false }: { asPage?: boolean }) {
  const t = await getTranslations('live');
  const site = await getSiteInfo();
  const live = await getLiveVideo();
  const Title = asPage ? 'h1' : 'h2';

  // Chips de horario: divide por "·" → ["Domingos 6 PM", "Miércoles 7 PM"]
  const scheduleChips = t('schedule').split('·').map(s => s.trim()).filter(Boolean);

  return (
    <section id="live" className="bg-[#061828] py-20 transition-colors duration-300 dark:bg-[#030e1a]">
      <div className="mx-auto max-w-3xl px-6 text-center">

        {/* ── Indicador de estado ── */}
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3" aria-hidden="true">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${live ? 'bg-red-400' : 'bg-white/20'}`} />
            <span className={`relative inline-flex h-3 w-3 rounded-full ${live ? 'bg-red-500' : 'bg-white/20'}`} />
          </span>
          <span className="text-sm font-semibold tracking-widest text-red-400 uppercase">
            {live ? t('statusLive') : t('status')}
          </span>
        </div>

        <Title className="mb-3 text-2xl font-bold text-white md:text-3xl">{t('title')}</Title>
        <p className="mx-auto mb-6 max-w-xl text-white/60">{t('text')}</p>

        {/* ── Horarios como chips ── */}
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold tracking-widest text-white/30 uppercase">{t('scheduleLabel')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {scheduleChips.map((chip, i) => (
              <span key={i} className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-white/70">
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* ── Transmisión activa: miniatura ── */}
        {live ? (
          <a
            href={`https://www.youtube.com/watch?v=${live.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mb-8 block overflow-hidden rounded-2xl border border-red-500/40 bg-black shadow-lg shadow-red-900/20 transition-transform duration-200 hover:scale-[1.01]"
            aria-label={live.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={live.thumbnail} alt={live.title} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-200 group-hover:bg-black/40" />
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
              {t('statusLive')}
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform duration-200 group-hover:scale-110">
                <svg className="h-7 w-7 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8">
              <p className="truncate text-sm font-semibold text-white">{live.title}</p>
            </div>
          </a>
        ) : (
          /* ── Sin transmisión: imagen de fondo ── */
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10" style={{ aspectRatio: '16/9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/placeholder-no-live.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
            <div className="absolute inset-0 bg-black/40" />
            {/* Contenido central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              <p className="text-sm font-semibold text-white drop-shadow">{t('noLiveText')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {scheduleChips.map((chip, i) => (
                  <span key={i} className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">{chip}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Botones de redes sociales ── */}
        <p className="mb-5 text-sm text-white/50">{live ? t('watchLiveOn') : t('watchOn')}</p>
        <div className="flex flex-wrap justify-center gap-3">

          {/* YouTube */}
          <a href={live ? `https://www.youtube.com/watch?v=${live.videoId}` : site.youtube}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:border-red-500 hover:bg-red-500/10">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            {live ? t('watchYoutubeLive') : t('watchYoutube')}
          </a>

          {/* Facebook */}
          <a href={site.facebook} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:border-blue-500 hover:bg-blue-500/10">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t('watchFacebook')}
          </a>

          {/* Instagram */}
          <a href={site.instagram} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:border-pink-500 hover:bg-pink-500/10">
            <svg className="h-5 w-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            {t('watchInstagram')}
          </a>

        </div>
      </div>
    </section>
  );
}
