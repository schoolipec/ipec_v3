'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

// Reglas de Juan:
//  - aparece 30 s después de entrar al sitio
//  - si solo se cierra → vuelve a aparecer 12 h después
//  - si marca "no volver a mostrar" → nunca más (en ese navegador)
const STORAGE_KEY = 'ipec-bible-modal';
const DELAY_MS = 30_000;
const SNOOZE_MS = 12 * 60 * 60 * 1000;
const NEVER = 'never';

type Verse = { text: string; ref: string };

// Versículo del día desde la base de datos (en el idioma del visitante, o inglés si falta)
async function loadVerse(locale: string): Promise<Verse | null> {
  try {
    const res = await fetch(`/api/verse-of-day?locale=${locale}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Verse;
    return data.text && data.ref ? data : null;
  } catch {
    return null;
  }
}

function shouldShow(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === NEVER) return false;
    if (saved && Date.now() < Number(saved)) return false;
  } catch {
    // Sin acceso a localStorage (modo privado estricto): se muestra igual
  }
  return true;
}

function remember(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sin localStorage no se puede recordar; no es crítico
  }
}

export default function BibleModal() {
  const t = useTranslations('bibleModal');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [neverAgain, setNeverAgain] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Pide el versículo justo antes de mostrarlo; si no hay versículo, no se muestra el modal
  useEffect(() => {
    if (!shouldShow()) return;
    const timer = setTimeout(async () => {
      const loaded = await loadVerse(locale);
      if (!loaded) return;
      setVerse(loaded);
      setOpen(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close lee neverAgain al momento de cerrar
  }, [open, neverAgain]);

  function close() {
    remember(neverAgain ? NEVER : String(Date.now() + SNOOZE_MS));
    setOpen(false);
  }

  if (!open || !verse) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="bible-modal-title" className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label={t('close')}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#1a1a2e] text-white/70 transition-all hover:bg-[#082942] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Libro abierto: en móvil las páginas se apilan */}
        <div className="flex flex-col overflow-hidden rounded-xl border-2 border-[#c9a227] shadow-[0_0_0_1px_rgba(201,162,39,0.3)] sm:flex-row">
          <div className="flex flex-1 flex-col justify-between border-b border-[rgba(150,100,30,0.2)] bg-[linear-gradient(to_right,#f5ead0,#f0e4c4)] px-6 py-6 sm:border-r sm:border-b-0 sm:px-8 sm:py-8">
            <div>
              <div className="mb-4 flex items-center justify-between pr-8 sm:pr-0">
                <span className="text-xs font-bold tracking-[0.2em] text-[#7a5c1e] uppercase">{t('church')}</span>
                <svg className="h-5 w-5" fill="none" stroke="#7a5c1e" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 9h14" />
                </svg>
              </div>
              <div className="mb-6 h-px bg-[linear-gradient(to_right,transparent,#c9a227,transparent)]" />
              <h2 id="bible-modal-title" className="mb-3 font-serif text-2xl font-bold text-[#1a1008]">
                {t('subtitle')}
              </h2>
              <span className="mb-4 block text-lg text-[#c9a227]" aria-hidden="true">
                ◆
              </span>
              <p className="font-serif text-sm leading-relaxed text-[#4a3520] italic">{t('description')}</p>
            </div>
            <div className="mt-6 flex items-center gap-3 opacity-30" aria-hidden="true">
              <div className="h-px flex-1 bg-[#7a5c1e]" />
              <span className="text-xs text-[#7a5c1e]">✦</span>
              <div className="h-px flex-1 bg-[#7a5c1e]" />
            </div>
          </div>

          {/* Marcapáginas rojo en el lomo */}
          <div className="relative hidden w-0 shrink-0 justify-center sm:flex" aria-hidden="true">
            <div className="absolute -top-1 z-10 h-20 w-6 rounded-b-[3px] bg-[linear-gradient(to_bottom,#c0392b,#922b21)] shadow-[2px_2px_6px_rgba(0,0,0,0.4)]" />
          </div>

          <div className="flex flex-1 flex-col bg-[linear-gradient(to_left,#f5ead0,#ede3c0)] px-6 py-6 sm:px-8 sm:py-8">
            <div className="mb-5">
              <span className="text-xs font-bold tracking-[0.2em] text-[#7a5c1e] uppercase">{t('verseLabel')}</span>
              <div className="mt-3 h-px bg-[linear-gradient(to_right,#c9a227,transparent)]" />
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-2 font-serif text-4xl leading-none text-[#c9a227]" aria-hidden="true">
                &ldquo;
              </div>
              <p className="mb-3 font-serif text-lg leading-snug font-bold text-[#1a1008]">{verse.text}</p>
              <p className="font-serif text-sm font-bold text-[#c0392b] italic">{verse.ref}</p>
            </div>
            <div className="mt-6">
              <label className="mb-4 flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={neverAgain}
                  onChange={(e) => setNeverAgain(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#7a5c1e]"
                />
                <span className="text-xs leading-relaxed text-[#4a3520]">{t('noShow')}</span>
              </label>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="w-full rounded-lg bg-[linear-gradient(135deg,#082942_0%,#0a3d5c_100%)] py-3 text-sm font-bold tracking-widest text-white uppercase transition-all hover:opacity-90"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
