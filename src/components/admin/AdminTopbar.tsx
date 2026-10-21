'use client';
import { useRouter } from 'next/navigation';
import type { Role } from '@prisma/client';

const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Admin',
  USER: 'Usuario',
};

export default function AdminTopbar({ name, email, role }: { name: string; email: string; role: Role }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Panel</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-100">IPEC v3</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium text-slate-100">{name}</span>
          <span className="text-xs text-slate-500">{ROLE_LABEL[role]} · {email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
