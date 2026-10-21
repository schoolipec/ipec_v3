'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/pastors', key: 'pastors' },
  { href: '/contact', key: 'contact' },
  { href: '/live', key: 'live' },
] as const;

function LiveDot() {
  return (
    <span className="relative mr-1.5 inline-flex h-2 w-2" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  );
}

export default function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const colorClass = (href: string) =>
    isActive(href) ? 'text-green dark:text-lime' : 'text-primary hover:text-green dark:hover:text-lime';
  const linkClass = (href: string) => `inline-flex items-center font-semibold transition-colors ${colorClass(href)}`;
  const mobileLinkClass = (href: string) =>
    `flex items-center rounded-lg px-3 py-3 text-base font-semibold transition-colors hover:bg-alt ${colorClass(href)}`;

  return (
    // z-50 + fondo propio: el header crea su capa y los menús desplegables siempre quedan encima del contenido
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur-md" style={{ background: 'var(--header-bg)' }}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:h-24">
        <Link href="/" className="shrink-0" aria-label={t('home')}>
          <Image src="/assets/logo-transparent.png" alt="Iglesia Plenitud en Cristo" width={640} height={640} priority className="h-14 w-auto sm:h-16 md:h-20 dark:hidden" />
          <Image src="/assets/logo-dark.png" alt="Iglesia Plenitud en Cristo" width={640} height={640} priority className="hidden h-14 w-auto sm:h-16 md:h-20 dark:block" />
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>
              {item.key === 'live' && <LiveDot />}
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher label={t('changeLanguage')} />
          <ThemeToggle label={t('toggleTheme')} />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-primary transition-colors hover:bg-alt lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="border-t border-line px-4 py-3 lg:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={mobileLinkClass(item.href)}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.key === 'live' && <LiveDot />}
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
