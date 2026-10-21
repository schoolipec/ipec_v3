'use client';
import { useState, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        const msgs: Record<string, string> = {
          invalid_token: 'Enlace inválido o ya fue usado',
          already_used: 'Este enlace ya fue usado',
          expired: 'El enlace ha expirado — pide uno nuevo',
          email_taken: 'Ese correo ya tiene cuenta',
          password_too_short: 'La contraseña debe tener al menos 8 caracteres',
        };
        setError(msgs[data.error] ?? 'Error del servidor');
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
          <h1 className="text-xl font-semibold text-slate-100">Crear tu contraseña</h1>
          <p className="text-sm text-slate-400">Bienvenido al panel de IPEC</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Contraseña</label>
            <input
              id="password" type="password" autoComplete="new-password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-sm font-medium text-slate-300">Confirmar contraseña</label>
            <input
              id="confirm" type="password" autoComplete="new-password" required
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Repite la contraseña"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-1 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-500 disabled:opacity-60"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta y entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
