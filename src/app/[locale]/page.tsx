import { setRequestLocale } from 'next-intl/server';
import HeroSection from '@/components/site/sections/HeroSection';
import LiveSection from '@/components/site/sections/LiveSection';
import GroupsSection from '@/components/site/sections/GroupsSection';
import AboutSection from '@/components/site/sections/AboutSection';
import OfferingSection from '@/components/site/sections/OfferingSection';
import VisionSection from '@/components/site/sections/VisionSection';
import SocialSection from '@/components/site/sections/SocialSection';

// Mismo orden que v2, sin la sección de contacto: el formulario de oración vive solo en Contact us
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <LiveSection />
      <GroupsSection />
      <AboutSection />
      <OfferingSection />
      <VisionSection />
      <SocialSection />
    </>
  );
}
