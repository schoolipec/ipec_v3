import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { SITE_INFO } from './siteInfo';

export default async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="bg-[#061828] py-10 text-white transition-colors duration-300 dark:bg-[#030e1a]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 text-center">
        <Image src="/assets/logo-dark.png" alt="Iglesia Plenitud en Cristo" width={640} height={640} className="h-28 w-auto" />
        <p className="text-sm text-white/70">{SITE_INFO.address}</p>
        <a href={`tel:${SITE_INFO.phoneHref}`} className="text-sm text-white/70 transition-colors hover:text-lime">
          {SITE_INFO.phone}
        </a>
        <small className="mt-2 text-xs text-white/40">{t('copyright', { year: new Date().getFullYear() })}</small>
      </div>
    </footer>
  );
}
