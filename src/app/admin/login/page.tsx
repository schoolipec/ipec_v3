'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import AuthLangToggle from '@/components/admin/AuthLangToggle';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useAdminLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error === 'invalid_credentials' ? t('auth.invalidCredentials') : t('auth.serverError'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh">
      {/* Fondo a pantalla completa en cualquier dispositivo */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/brand/fondo-quelea.jpg)' }}
      />

      <div className="relative z-10 flex min-h-dvh items-start justify-center px-4 pb-10 pt-[14vh]">
        <div className="relative w-full max-w-[490px] rounded-2xl border border-lime-400/40 p-6 shadow-2xl sm:p-10" style={{ background: 'linear-gradient(160deg, #082942 0%, #0d4a5c 55%, #136b66 100%)' }}>
          <AuthLangToggle />
          <div className="mb-6 flex flex-col items-center gap-4">
            <Image src="/assets/logo-white-login.png" alt="Iglesia Plenitud en Cristo" width={542} height={291} className="w-72 max-w-full sm:w-80 h-auto" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">{t('auth.email')}</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="rounded-lg border border-slate-600/70 bg-slate-950/60 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-600/70 bg-slate-950/60 px-3 py-2.5 pr-11 text-slate-100 placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/admin/forgot" className="text-xs text-slate-300 underline-offset-2 hover:text-white hover:underline">
                  {t('auth.forgot')}
                </Link>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-300">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="mt-1 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-500 disabled:opacity-60"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
