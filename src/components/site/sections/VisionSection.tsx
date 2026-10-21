import { getTranslations } from 'next-intl/server';
import { SectionLabel } from './ui';

export default async function VisionSection() {
  const t = await getTranslations('vision');
  const pillars = [
    { icon: '⌂', label: t('reach'), text: t('reachText') },
    { icon: '♙', label: t('strengthen'), text: t('strengthenText') },
    { icon: '✦', label: t('form'), text: t('formText') },
    { icon: '◎', label: t('send'), text: t('sendText') },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <SectionLabel>{t('label')}</SectionLabel>
          <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">{t('title')}</h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-secondary">{t('text')}</p>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.label} className="rounded-xl border border-line bg-card/90 p-5 text-center sm:p-6">
              <div className="mb-3 text-3xl font-bold text-[#7CB342]" aria-hidden="true">
                {p.icon}
              </div>
              <h3 className="mb-2 font-bold text-primary">{p.label}</h3>
              <p className="text-sm leading-relaxed text-secondary">{p.text}</p>
            </div>
          ))}
        </div>

        {/* En oscuro se aclara y lleva borde: con el mismo azul del fondo desaparecía */}
        <div className="rounded-2xl bg-[#061828] p-8 text-white dark:border dark:border-line dark:bg-[#0f2a42]">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {[t('presence'), t('character'), t('service')].map((label) => (
              <span key={label} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/80">
                {label}
              </span>
            ))}
          </div>
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-white/90 italic md:text-xl">{t('quote')}</p>
          </blockquote>
          <p className="mt-8 text-center text-sm text-white/50">{t('schedule')}</p>
        </div>
      </div>
    </section>
  );
}
