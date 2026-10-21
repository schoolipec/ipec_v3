import { setRequestLocale } from 'next-intl/server';
import AboutSection from '@/components/site/sections/AboutSection';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutSection asPage />;
}
