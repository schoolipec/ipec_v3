'use client';
import { useAdminLang } from '@/components/admin/AdminLangContext';

// Selector EN/ES de las pantallas de acceso (ingreso, recuperar y nueva contraseña)
export default function AuthLangToggle() {
  const { lang, setLang, t } = useAdminLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      title={t('auth.language')}
      aria-label={t('auth.language')}
      className="absolute right-3 top-3 rounded-md border border-slate-500/50 px-2 py-1 text-xs font-semibold tracking-wide text-slate-200 transition hover:border-lime-400 hover:text-white"
    >
      {lang.toUpperCase()}
    </button>
  );
}
