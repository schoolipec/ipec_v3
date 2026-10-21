'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, FileText, HandHeart, Users, UserCircle,
  Shield, ExternalLink, PanelLeftClose, PanelLeftOpen, X,
} from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import type { Role } from '@prisma/client';

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles?: Role[];
};

const NAV: NavItem[] = [
  { href: '/admin',          labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { href: '/admin/content',  labelKey: 'sidebar.content',   icon: FileText },
  { href: '/admin/prayer',   labelKey: 'sidebar.prayer',    icon: HandHeart },
  { href: '/admin/users',    labelKey: 'sidebar.users',     icon: Users, roles: ['SUPERADMIN', 'ADMIN'] },
  { href: '/admin/profile',  labelKey: 'sidebar.profile',   icon: UserCircle },
  { href: '/admin/security', labelKey: 'sidebar.security',  icon: Shield },
];

interface Props {
  role: Role;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ role, collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: Props) {
  const path = usePathname();
  const { t } = useAdminLang();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === 'light' ? '/assets/logo-transparent.png' : '/assets/logo-white.png';
  const items = NAV.filter(item => !item.roles || item.roles.includes(role));

  const isActive = (href: string) =>
    href === '/admin' ? path === '/admin' : path.startsWith(href);

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={`admin-sidebar-overlay${mobileOpen ? ' active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Logo + título + toggle */}
        <div className="flex flex-col gap-3 px-4 pt-4 pb-4"
             style={{ borderBottom: '1px solid var(--admin-border)' }}>
          <div className="flex items-center justify-between">
            <Image src={logoSrc} alt="Iglesia Plenitud en Cristo" width={640} height={640} priority unoptimized
                   className={collapsed ? 'h-12 w-12' : 'h-28 w-28'} />
            {/* Botón colapsar — solo en desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center rounded-lg p-1 transition"
              style={{ color: 'var(--admin-text-muted)' }}
              title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {/* Botón cerrar — solo en móvil */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden flex items-center justify-center rounded-lg p-1 transition"
              style={{ color: 'var(--admin-text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
          {!collapsed && (
            <div className="leading-tight" style={{ color: 'var(--admin-text)' }}>
              <p className="text-base font-semibold">Iglesia</p>
              <p className="text-base font-semibold">Plenitud en Cristo</p>
            </div>
          )}
        </div>

        {/* Links de navegación */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2 overflow-y-auto">
          {items.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item${active ? ' active' : ''}`}
                title={collapsed ? t(item.labelKey) : undefined}
                onClick={() => { if (window.innerWidth < 1024) onCloseMobile(); }}
              >
                <Icon size={18} className="nav-icon" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Ver sitio */}
        <div className="p-2" style={{ borderTop: '1px solid var(--admin-border)' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-item"
            title={collapsed ? t('sidebar.viewSite') : undefined}
          >
            <ExternalLink size={18} className="nav-icon" />
            {!collapsed && <span>{t('sidebar.viewSite')}</span>}
          </a>
        </div>
      </aside>
    </>
  );
}
