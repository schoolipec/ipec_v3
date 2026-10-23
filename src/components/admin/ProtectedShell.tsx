'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import ScrollToTop from '@/components/ScrollToTop';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import type { Role } from '@prisma/client';

const PAGE_TITLE_KEYS: Record<string, string> = {
  '/admin':          'sidebar.dashboard',
  '/admin/content':  'sidebar.content',
  '/admin/prayer':   'sidebar.prayer',
  '/admin/users':    'sidebar.users',
  '/admin/mails':    'sidebar.mails',
  '/admin/profile':  'sidebar.profile',
  '/admin/security': 'sidebar.security',
};

interface Props {
  name: string;
  email: string;
  role: Role;
  /** Minutos de inactividad antes de cerrar la sesión (0 = sin timeout de cliente) */
  sessionTimeout: number;
  children: React.ReactNode;
}

export default function ProtectedShell({ name, email, role, sessionTimeout, children }: Props) {
  const pathname = usePathname();
  const { t } = useAdminLang();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  // Idle timer: detecta inactividad del usuario en el cliente y cierra la sesión
  useEffect(() => {
    if (sessionTimeout <= 0) return;

    const timeoutMs = sessionTimeout * 60_000;
    let timer: ReturnType<typeof setTimeout>;

    async function handleIdle() {
      try { await fetch('/api/admin/logout', { method: 'POST' }); } catch { /* ignorar */ }
      window.location.assign('/admin/login');
    }

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(handleIdle, timeoutMs);
    }

    // Cualquier interacción del usuario reinicia el contador
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;
    EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // arrancar el contador desde que se monta el shell

    return () => {
      clearTimeout(timer);
      EVENTS.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [sessionTimeout]);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('adminSidebarCollapsed', String(next));
  }

  const pageTitle = t(PAGE_TITLE_KEYS[pathname] ?? 'sidebar.dashboard');

  return (
    <div className="admin-shell">
      <AdminSidebar
        role={role}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`admin-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <AdminTopbar
          name={name}
          email={email}
          role={role}
          pageTitle={pageTitle}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main data-scroll-root className="flex-1 overflow-y-auto p-6">{children}</main>
        <ScrollToTop />
      </div>
    </div>
  );
}
