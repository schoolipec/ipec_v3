import { setRequestLocale } from 'next-intl/server';
import PastorsContent from '@/components/site/sections/PastorsContent';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PastorsContent />;
}
