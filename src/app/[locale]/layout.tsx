import type { Metadata } from 'next';
import ScrollToTop from '@/components/ScrollToTop';
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

const BASE_URL = 'https://suplenitud.com';

const CHURCH_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Church',
  name: 'Iglesia Plenitud en Cristo',
  url: BASE_URL,
  telephone: '+17023282536',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5000 Spencer St',
    addressLocality: 'Las Vegas',
    addressRegion: 'NV',
    postalCode: '89119',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 36.0937,
    longitude: -115.1328,
  },
  openingHours: ['Su 18:00-20:00', 'We 19:00-21:00'],
  sameAs: [
    'https://www.youtube.com/@Pr.MarioAlsina',
    'https://www.instagram.com/prmarioalsina',
  ],
  image: `${BASE_URL}/assets/og-image.jpg`,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const title = t('title');
  const description = t('description');
  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    icons: { icon: '/assets/logo-transparent.png' },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: 'Iglesia Plenitud en Cristo',
      images: [{ url: '/assets/og-image.jpg', width: 1200, height: 630, alt: title }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/assets/og-image.jpg'],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        es: `${BASE_URL}/es`,
        en: `${BASE_URL}/en`,
        pt: `${BASE_URL}/pt`,
        de: `${BASE_URL}/de`,
        ko: `${BASE_URL}/ko`,
      },
    },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(CHURCH_SCHEMA) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider>
          <WaveBackground />
          <Header />
          <main className="flex-1">{children}</main>
          <ScrollToTop />
          <Footer />
          <BibleModal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
