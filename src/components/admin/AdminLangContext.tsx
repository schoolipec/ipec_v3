'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import enMessages from '@/messages/admin/en.json';
import esMessages from '@/messages/admin/es.json';

type Messages = typeof enMessages;
type Lang = 'en' | 'es';

const MESSAGES: Record<Lang, Messages> = { en: enMessages, es: esMessages };
const STORAGE_KEY = 'ipec_admin_lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: (k) => k });

function resolve(obj: unknown, path: string): string {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string ?? path;
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

// Preferencia explícita del usuario (selector); si nunca se eligió, inglés por defecto
function readLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'es') return v;
  } catch { /* almacenamiento bloqueado */ }
  return 'en';
}

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => { setLangState(readLang()); }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* almacenamiento bloqueado: solo dura la sesión de la pestaña */ }
  }, []);

  const t = useCallback((path: string, vars?: Record<string, string | number>) => {
    return interpolate(resolve(MESSAGES[lang], path), vars);
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useAdminLang() { return useContext(Ctx); }
