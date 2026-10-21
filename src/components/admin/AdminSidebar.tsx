'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import type { Role } from '@prisma/client';

type NavItem = { href: string; label: string; icon: string; roles?: Role[] };

const NAV: NavItem[] = [
  { href: '/admin/dashboard',         label: 'Dashboard',         icon: '⊞' },
  { href: '/admin/dashboard/content', label: 'Contenido',         icon: '✏' },
  { href: '/admin/dashboard/prayer',  label: 'Pedidos de oración',icon: '🙏' },
  { href: '/admin/dashboard/users',   label: 'Usuarios',          icon: '👥', roles: ['SUPERADMIN', 'ADMIN'] },
  { href: '/admin/dashboard/profile', label: 'Mi perfil',         icon: '👤' },
];

export default function AdminSidebar({ role }: { role: Role }) {
  const path = usePathname();

  const items = NAV.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
        <Image src="/assets/logo-white.png" alt="IPEC" width={32} height={32} className="h-8 w-auto" />
        <span className="font-semibold text-slate-100">Admin — IPEC</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map(item => {
          const active = path === item.href || (item.href !== '/admin/dashboard' && path.startsWith(item.href));
          return (
            <Link
              key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-green-700/20 text-green-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 px-3 py-3">
        <a href="/" target="_blank" rel="noopener"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition">
          <span className="w-5 text-center">↗</span>
          Ver sitio
        </a>
      </div>
    </aside>
  );
}
