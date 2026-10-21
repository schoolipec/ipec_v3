'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import enMessages from '@/messages/admin/en.json';
import esMessages from '@/messages/admin/es.json';

type Messages = typeof enMessages;
type Lang = 'en' | 'es';

const MESSAGES: Record<Lang, Messages> = { en: enMessages, es: esMessages };
const COOKIE_KEY = 'admin_lang';

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

export function AdminLangProvider({ children, initial }: { children: ReactNode; initial?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initial ?? 'en');

  useEffect(() => {
    // Leer cookie al montar
    const match = document.cookie.match(/(?:^|; )admin_lang=([^;]+)/);
    if (match && (match[1] === 'en' || match[1] === 'es')) {
      setLangState(match[1]);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.cookie = `${COOKIE_KEY}=${l};path=/;max-age=31536000;samesite=lax`;
    // Persistir en el perfil del usuario también
    fetch('/api/admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminLocale: l }),
    }).catch(() => {});
  }, []);

  const t = useCallback((path: string, vars?: Record<string, string | number>) => {
    return interpolate(resolve(MESSAGES[lang], path), vars);
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useAdminLang() { return useContext(Ctx); }
