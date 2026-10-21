'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        setError(data.error === 'invalid_credentials' ? 'Email o contraseña incorrectos' : 'Error del servidor');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src="/assets/logo-white.png" alt="IPEC" width={64} height={64} className="h-16 w-auto" />
          <h1 className="text-xl font-semibold text-slate-100">Panel administrativo</h1>
          <p className="text-sm text-slate-400">Iglesia Plenitud en Cristo</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">Correo</label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none ring-0 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Contraseña</label>
            <input
              id="password" type="password" autoComplete="current-password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-1 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-500 disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}
