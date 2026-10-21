'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_OPTIONS } from './locales';

export default function LanguageSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const active = LOCALE_OPTIONS.find((o) => o.code === locale) ?? LOCALE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function choose(code: (typeof LOCALE_OPTIONS)[number]['code']) {
    setOpen(false);
    if (code === locale) return;
    startTransition(() => router.replace(pathname, { locale: code }));
  }

  // El aro de la bandera se ajusta al tema para que se distinga en fondo claro y oscuro
  const flagClass = 'h-[14px] w-5 rounded-[3px] object-cover ring-1 ring-black/15 dark:ring-white/40';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`inline-flex h-10 items-center gap-2 rounded-full border border-line bg-card/70 px-3 text-sm font-bold text-primary transition-colors hover:border-green dark:hover:border-lime ${pending ? 'opacity-60' : ''}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono de 40px, no necesita optimización */}
        <img src={active.flag} alt="" width={20} height={14} className={flagClass} />
        <span className="uppercase tracking-wide">{active.code}</span>
        <svg className={`h-3 w-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-xl"
        >
          {LOCALE_OPTIONS.map((o) => {
            const isActive = o.code === locale;
            return (
              <li key={o.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => choose(o.code)}
                  lang={o.code}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-alt ${isActive ? 'font-semibold text-green dark:text-lime' : 'text-primary'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- ícono de 40px, no necesita optimización */}
                  <img src={o.flag} alt="" width={20} height={14} className={flagClass} />
                  <span>{o.label}</span>
                  {isActive && (
                    <svg className="ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
