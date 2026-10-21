'use client';
import { useState, FormEvent } from 'react';

type ProfileData = {
  name: string; email: string; adminLocale: string;
  notifyTelegram: boolean; notifyEmail: boolean;
};

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [adminLocale, setAdminLocale] = useState(initial.adminLocale);
  const [notifyTelegram, setNotifyTelegram] = useState(initial.notifyTelegram);
  const [notifyEmail, setNotifyEmail] = useState(initial.notifyEmail);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (newPwd && newPwd !== confirmPwd) {
      setMsg({ type: 'err', text: 'Las contraseñas nuevas no coinciden' }); return;
    }

    const body: Record<string, unknown> = { name, adminLocale, notifyTelegram, notifyEmail };
    if (email !== initial.email) body.email = email;
    if (newPwd) { body.newPassword = newPwd; }
    if (body.email || body.newPassword) body.currentPassword = currentPwd;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Cambios guardados.' });
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        const data = await res.json();
        const msgs: Record<string, string> = {
          invalid_password: 'La contraseña actual es incorrecta',
          email_taken: 'Ese correo ya está en uso',
          password_too_short: 'La contraseña debe tener al menos 8 caracteres',
          password_required: 'Ingresa tu contraseña actual para cambiar correo o contraseña',
        };
        setMsg({ type: 'err', text: msgs[data.error] ?? 'Error al guardar' });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      {/* Datos generales */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-semibold text-slate-100">Datos generales</h2>
        <div className="flex flex-col gap-4">
          <Field label="Nombre" id="name">
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required
              className="input-admin" />
          </Field>
          <Field label="Correo" id="email">
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="input-admin" />
          </Field>
          <Field label="Idioma del panel" id="locale">
            <select id="locale" value={adminLocale} onChange={e => setAdminLocale(e.target.value)}
              className="input-admin">
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-semibold text-slate-100">Notificaciones de pedidos de oración</h2>
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" checked={notifyTelegram} onChange={e => setNotifyTelegram(e.target.checked)}
              className="accent-green-500" />
            Recibir aviso por Telegram
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)}
              className="accent-green-500" />
            Recibir aviso por correo electrónico
          </label>
        </div>
      </div>

      {/* Contraseña */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 font-semibold text-slate-100">Cambiar contraseña</h2>
        <div className="flex flex-col gap-4">
          <Field label="Contraseña actual" id="currentPwd">
            <input id="currentPwd" type="password" autoComplete="current-password"
              value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
              className="input-admin" placeholder="Requerida si cambias correo o contraseña" />
          </Field>
          <Field label="Nueva contraseña" id="newPwd">
            <input id="newPwd" type="password" autoComplete="new-password"
              value={newPwd} onChange={e => setNewPwd(e.target.value)}
              className="input-admin" placeholder="Mínimo 8 caracteres" />
          </Field>
          <Field label="Confirmar nueva contraseña" id="confirmPwd">
            <input id="confirmPwd" type="password" autoComplete="new-password"
              value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              className="input-admin" />
          </Field>
        </div>
      </div>

      {msg && (
        <p className={`rounded-lg px-4 py-2.5 text-sm ${
          msg.type === 'ok' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
        }`}>
          {msg.text}
        </p>
      )}

      <button type="submit" disabled={saving}
        className="self-start rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-500 disabled:opacity-60">
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}
