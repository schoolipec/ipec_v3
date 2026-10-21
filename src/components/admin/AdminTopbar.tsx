'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Globe, UserCircle, Shield, LogOut, ChevronDown, Menu,
} from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import type { Role } from '@prisma/client';

interface Props {
  name: string;
  email: string;
  role: Role;
  pageTitle: string;
  onOpenMobile: () => void;
}

const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Admin',
  USER: 'User',
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminTopbar({ name, email, role, pageTitle, onOpenMobile }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useAdminLang();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const isDark = mounted ? theme === 'dark' : true;

  return (
    <header className="admin-topbar">
      {/* Izquierda: botón móvil + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden flex items-center justify-center rounded-lg p-1.5 transition"
          style={{ color: 'var(--admin-text-muted)' }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--admin-text)' }}>{pageTitle}</h1>
      </div>

      {/* Derecha: controles */}
      <div className="flex items-center gap-2">
        {/* Toggle dark/light */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center justify-center rounded-lg p-2 transition"
            style={{ color: 'var(--admin-text-muted)' }}
            title={isDark ? t('topbar.light') : t('topbar.dark')}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Selector de idioma */}
        <button
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
          style={{
            color: 'var(--admin-text-muted)',
            border: '1px solid var(--admin-border)',
          }}
          title={t('topbar.language')}
        >
          <Globe size={14} />
          {lang.toUpperCase()}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition"
            style={{ color: 'var(--admin-text)' }}
          >
            <div className="admin-avatar">{getInitials(name)}</div>
            <span className="hidden sm:block text-sm font-medium">{name}</span>
            <ChevronDown size={14} style={{ color: 'var(--admin-text-muted)' }} />
          </button>

          {open && (
            <div className="admin-dropdown">
              {/* Info del usuario */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>{email}</p>
                <span className="admin-role-badge mt-1.5 inline-block">{ROLE_LABEL[role]}</span>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link href="/admin/profile" className="admin-dropdown-item" onClick={() => setOpen(false)}>
                  <UserCircle size={15} />
                  {t('topbar.profile')}
                </Link>
                <Link href="/admin/security" className="admin-dropdown-item" onClick={() => setOpen(false)}>
                  <Shield size={15} />
                  {t('topbar.security')}
                </Link>
              </div>

              <div className="admin-dropdown-divider" />

              {/* Logout */}
              <div className="py-1">
                <button className="admin-dropdown-item danger w-full" onClick={handleLogout}>
                  <LogOut size={15} />
                  {t('topbar.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
