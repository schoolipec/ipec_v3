'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Role } from '@prisma/client';

type UserRow = {
  id: string; email: string; name: string; role: Role; adminLocale: string;
  permissions: Record<string, boolean>; notifyTelegram: boolean; notifyEmail: boolean; createdAt: string;
};

const ROLE_LABEL: Record<Role, string> = { SUPERADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'Usuario' };
const SECTIONS = ['hero', 'about', 'groups', 'pastors', 'contact', 'live', 'offering', 'social'];
const SECTION_LABEL: Record<string, string> = {
  hero: 'Hero', about: 'Acerca de', groups: 'Grupos', pastors: 'Pastores',
  contact: 'Contacto', live: 'En vivo', offering: 'Ofrendas', social: 'Redes',
};

export default function UsersPanel({ currentRole }: { currentRole: Role }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [permOpen, setPermOpen] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState('');

  // Formulario de invitación
  const [invEmail, setInvEmail] = useState('');
  const [invName, setInvName] = useState('');
  const [invRole, setInvRole] = useState<Role>('USER');
  const [invError, setInvError] = useState('');
  const [invLoading, setInvLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function sendInvitation() {
    setInvError(''); setInvLoading(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invEmail, name: invName, role: invRole }),
      });
      const data = await res.json();
      if (!res.ok) { setInvError(data.error ?? 'Error'); return; }
      setInviteLink(data.link);
      setInvEmail(''); setInvName(''); setInvRole('USER');
    } finally { setInvLoading(false); }
  }

  async function savePermissions(userId: string, perms: Record<string, boolean>) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permissions: perms }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: perms } : u));
    setPermOpen(null);
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Botón de invitación */}
      <div className="flex justify-end">
        <button onClick={() => { setInviteOpen(!inviteOpen); setInviteLink(''); }}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition">
          + Invitar usuario
        </button>
      </div>

      {/* Formulario de invitación */}
      {inviteOpen && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="mb-4 font-semibold text-slate-100">Nueva invitación</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Correo</label>
              <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-500"
                placeholder="correo@ejemplo.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Nombre</label>
              <input type="text" value={invName} onChange={e => setInvName(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-500"
                placeholder="Nombre completo" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Rol</label>
              <select value={invRole} onChange={e => setInvRole(e.target.value as Role)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-500">
                <option value="USER">Usuario</option>
                <option value="ADMIN">Admin</option>
                {currentRole === 'SUPERADMIN' && <option value="SUPERADMIN">Super Admin</option>}
              </select>
            </div>
          </div>
          {invError && <p className="mt-2 text-sm text-red-400">{invError}</p>}
          {inviteLink && (
            <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2.5">
              <p className="mb-1 text-xs text-slate-400">Enlace de invitación (expira en 72 h):</p>
              <p className="break-all text-sm text-green-400">{inviteLink}</p>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button onClick={sendInvitation} disabled={invLoading || !invEmail || !invName}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-40 transition">
              {invLoading ? 'Enviando…' : 'Generar enlace'}
            </button>
            <button onClick={() => setInviteOpen(false)} className="text-sm text-slate-400 hover:text-slate-200">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      {loading && <p className="text-sm text-slate-500">Cargando…</p>}
      <div className="flex flex-col gap-3">
        {users.map(u => (
          <div key={u.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-100">{u.name}</p>
                <p className="text-sm text-slate-400">{u.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ROLE_LABEL[u.role]} · {u.adminLocale.toUpperCase()} ·
                  {u.notifyTelegram ? ' 📱 Telegram' : ''}{u.notifyEmail ? ' 📧 Email' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {u.role === 'USER' && (
                  <button onClick={() => setPermOpen(p => p === u.id ? null : u.id)}
                    className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200">
                    Permisos
                  </button>
                )}
                {currentRole === 'SUPERADMIN' && (
                  <button onClick={() => deleteUser(u.id, u.name)}
                    className="rounded-lg border border-red-900 px-2.5 py-1 text-xs text-red-400 hover:border-red-700">
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Panel de permisos inline */}
            {permOpen === u.id && u.role === 'USER' && (
              <PermissionsEditor
                userId={u.id}
                initial={u.permissions}
                onSave={(perms) => savePermissions(u.id, perms)}
                onCancel={() => setPermOpen(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionsEditor({
  userId, initial, onSave, onCancel,
}: {
  userId: string;
  initial: Record<string, boolean>;
  onSave: (p: Record<string, boolean>) => void;
  onCancel: () => void;
}) {
  const [perms, setPerms] = useState({ ...initial });
  void userId;

  const toggle = (s: string) => setPerms(p => ({ ...p, [s]: !p[s] }));

  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <p className="mb-2 text-xs font-medium text-slate-400">Secciones que puede editar:</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SECTIONS.map(s => (
          <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={!!perms[s]} onChange={() => toggle(s)}
              className="accent-green-500" />
            {SECTION_LABEL[s]}
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-3">
        <button onClick={() => onSave(perms)}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 transition">
          Guardar permisos
        </button>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-200">
          Cancelar
        </button>
      </div>
    </div>
  );
}
