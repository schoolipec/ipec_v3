import { setRequestLocale } from 'next-intl/server';
import PagePlaceholder from '@/components/site/PagePlaceholder';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PagePlaceholder titleKey="pastors" />;
}
