import { setRequestLocale } from 'next-intl/server';
import LiveSection from '@/components/site/sections/LiveSection';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LiveSection asPage />;
}
