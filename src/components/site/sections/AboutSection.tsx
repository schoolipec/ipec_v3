import Image from 'next/image';
import RichText from '@/components/RichText';
import { getTranslations } from 'next-intl/server';
import { getSiteInfo } from '../siteInfo';
import { Link } from '@/i18n/navigation';

// Igual que demo.suplenitud.com: foto del grupo a la izquierda, bloque azul marino a la derecha
export default async function AboutSection({ asPage = false }: { asPage?: boolean }) {
  const t = await getTranslations('about');
  const site = await getSiteInfo();
  const Title = asPage ? 'h1' : 'h2';

  return (
    <section id="about" className="grid grid-cols-1 bg-[#0a2240] md:grid-cols-2 dark:bg-[#061828]">
      <div className="relative min-h-72 md:min-h-[32rem]">
        {/* En su propia página es lo primero que se ve: carga prioritaria */}
        <Image src={site.aboutImage} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority={asPage} />
      </div>
      <div className="flex items-center px-8 py-16 md:px-16 lg:px-32">
        <div className="max-w-xl">
          <Title className="mb-4 text-3xl font-bold text-white md:text-4xl"><RichText html={t('title')} /></Title>
          <p className="mb-6 text-lg leading-relaxed text-white/85"><RichText html={t('text')} /></p>
          <Link href="/pastors" className="font-bold text-white transition-colors hover:text-lime">
            {t('meetPastors')}
          </Link>
        </div>
      </div>
    </section>
  );
}
