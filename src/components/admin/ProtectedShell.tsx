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
  '/admin/profile':  'sidebar.profile',
  '/admin/security': 'sidebar.security',
};

interface Props {
  name: string;
  email: string;
  role: Role;
  children: React.ReactNode;
}

export default function ProtectedShell({ name, email, role, children }: Props) {
  const pathname = usePathname();
  const { t } = useAdminLang();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

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
