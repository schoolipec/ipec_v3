'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import AuthLangToggle from '@/components/admin/AuthLangToggle';

export default function ForgotPage() {
  const { t } = useAdminLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) setError(t('auth.tooMany'));
      else setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh">
      <div aria-hidden="true" className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/assets/brand/fondo-quelea.jpg)' }} />
      <div className="relative z-10 flex min-h-dvh items-start justify-center px-4 pb-10 pt-[14vh]">
        <div className="relative w-full max-w-[490px] rounded-2xl border border-lime-400/40 p-6 shadow-2xl sm:p-10" style={{ background: 'linear-gradient(160deg, #082942 0%, #0d4a5c 55%, #136b66 100%)' }}>
          <AuthLangToggle />
          <div className="mb-6 flex flex-col items-center gap-4">
            <Image src="/assets/logo-white-login.png" alt="Iglesia Plenitud en Cristo" width={542} height={291} className="w-72 max-w-full sm:w-80 h-auto" />
            <h1 className="text-xl font-semibold text-slate-100">{t('auth.recoverTitle')}</h1>
          </div>

          {sent ? (
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-slate-200">{t('auth.recoverSent')}</p>
              <Link href="/admin/login" className="text-sm text-slate-300 underline-offset-2 hover:text-white hover:underline">{t('auth.backToSignIn')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">{t('auth.recoverAccountEmail')}</label>
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="rounded-lg border border-slate-600/70 bg-slate-950/60 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
              {error && <p className="rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={loading} className="rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-500 disabled:opacity-60">
                {loading ? t('auth.recoverSending') : t('auth.recoverSend')}
              </button>
              <Link href="/admin/login" className="text-center text-xs text-slate-300 underline-offset-2 hover:text-white hover:underline">{t('auth.backToSignIn')}</Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
