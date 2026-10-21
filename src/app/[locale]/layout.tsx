import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { THEME_COOKIE, isTheme } from '@/components/site/theme';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import WaveBackground from '@/components/site/WaveBackground';
import BibleModal from '@/components/site/BibleModal';
import './site.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('title'),
    description: t('description'),
    icons: { icon: '/assets/logo-transparent.png' },
  };
}

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Con cookie: clase explícita. Sin cookie: sin clase y el CSS sigue la preferencia del sistema
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const themeClass = isTheme(saved) ? saved : undefined;

  return (
    <html lang={locale} className={themeClass} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <WaveBackground />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BibleModal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
