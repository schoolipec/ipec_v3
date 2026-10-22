'use client';
import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import AuthLangToggle from '@/components/admin/AuthLangToggle';

export default function ResetPage() {
  const router = useRouter();
  const { t } = useAdminLang();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('auth.passwordShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) setDone(true);
      else setError(t('auth.tokenInvalid'));
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
            <h1 className="text-xl font-semibold text-slate-100">{t('auth.newPasswordTitle')}</h1>
          </div>

          {done ? (
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-slate-200">{t('auth.passwordChanged')}</p>
              <button onClick={() => router.push('/admin/login')} className="rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-500">{t('auth.goToSignIn')}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">{t('auth.newPassword')}</label>
                <input id="password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="rounded-lg border border-slate-600/70 bg-slate-950/60 px-3 py-2.5 text-slate-100 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-sm font-medium text-slate-200">{t('auth.confirmPassword')}</label>
                <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="rounded-lg border border-slate-600/70 bg-slate-950/60 px-3 py-2.5 text-slate-100 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
              </div>
              {error && <p className="rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={loading} className="rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-500 disabled:opacity-60">
                {loading ? t('auth.savingNewPassword') : t('auth.saveNewPassword')}
              </button>
              <Link href="/admin/forgot" className="text-center text-xs text-slate-300 underline-offset-2 hover:text-white hover:underline">{t('auth.requestNewLink')}</Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
