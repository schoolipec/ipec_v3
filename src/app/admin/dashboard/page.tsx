import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';

export default async function DashboardHome() {
  const user = await getSession();
  const [prayerCount, userCount] = await Promise.all([
    prisma.prayerRequest.count(),
    prisma.user.count(),
  ]);

  const roleLabel: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    ADMIN: 'Admin',
    USER: 'Usuario',
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Bienvenido, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {roleLabel[user?.role ?? 'USER']} · {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pedidos de oración" value={prayerCount} href="/admin/dashboard/prayer" />
        {(user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') && (
          <StatCard label="Usuarios" value={userCount} href="/admin/dashboard/users" />
        )}
        <StatCard label="Secciones de contenido" value={8} href="/admin/dashboard/content" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-100">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/admin/dashboard/content" label="Editar contenido" />
          <QuickLink href="/admin/dashboard/prayer" label="Ver pedidos de oración" />
          {(user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') && (
            <QuickLink href="/admin/dashboard/users" label="Gestionar usuarios" />
          )}
          <QuickLink href="/admin/dashboard/profile" label="Mi perfil" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <a href={href} className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <span className="text-3xl font-bold text-slate-100">{value}</span>
      <span className="text-sm text-slate-400">{label}</span>
    </a>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href}
      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-green-700 hover:text-green-400">
      {label} →
    </a>
  );
}
