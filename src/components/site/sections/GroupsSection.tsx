import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getSiteInfo } from '../siteInfo';
import { SectionLabel } from './ui';

const ICONS = [
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
];

// Sin botones de acción: no hay página de grupos (decisión de Juan)
export default async function GroupsSection() {
  const t = await getTranslations('groups');
  const site = await getSiteInfo();
  const groups = [
    { title: t('smallTitle'), text: t('smallText') },
    { title: t('trainingTitle'), text: t('trainingText') },
    { title: t('plenitudeTitle'), text: t('plenitudeText') },
  ];

  return (
    <section id="groups" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <SectionLabel>{t('label')}</SectionLabel>
          <h2 className="text-3xl font-bold text-primary md:text-4xl">{t('title')}</h2>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            {groups.map((g, i) => (
              <div key={g.title} className="rounded-xl border border-line bg-card/90 p-6 transition-colors hover:border-[#7CB342]">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#7CB342]/10">
                  <svg className="h-5 w-5 text-[#7CB342]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICONS[i]} />
                  </svg>
                </span>
                <h3 className="mb-1 text-lg font-bold text-primary">{g.title}</h3>
                <p className="text-sm leading-relaxed text-secondary">{g.text}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl shadow-xl">
            <Image src={site.groupsImage} alt={t('title')} width={1536} height={1024} sizes="(min-width: 768px) 50vw, 100vw" className="h-auto w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
