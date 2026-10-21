'use client';
import Link from 'next/link';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import { BarChart3, HandHeart, Users, FileText } from 'lucide-react';
import type { Role } from '@prisma/client';

interface Props {
  userName: string;
  userRole: Role;
  userEmail: string;
  prayerCount: number;
  userCount: number;
}

export default function DashboardHome({ userName, userRole, userEmail, prayerCount, userCount }: Props) {
  const { t } = useAdminLang();
  const canSeeUsers = userRole === 'SUPERADMIN' || userRole === 'ADMIN';

  const ROLE_LABEL: Record<Role, string> = {
    SUPERADMIN: 'Super Admin',
    ADMIN: 'Admin',
    USER: 'User',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
          {t('dashboard.welcome')}, {userName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          {ROLE_LABEL[userRole]} · {userEmail}
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t('dashboard.prayerRequests')}
          value={prayerCount}
          href="/admin/prayer"
          icon={<HandHeart size={20} />}
        />
        {canSeeUsers && (
          <StatCard
            label={t('dashboard.users')}
            value={userCount}
            href="/admin/users"
            icon={<Users size={20} />}
          />
        )}
        <StatCard
          label={t('dashboard.contentSections')}
          value={8}
          href="/admin/content"
          icon={<FileText size={20} />}
        />
      </div>

      {/* Accesos rápidos */}
      <div className="admin-card">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--admin-text)' }}>
          <BarChart3 size={18} style={{ color: 'var(--admin-accent)' }} />
          {t('dashboard.quickLinks')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/admin/content" label={t('dashboard.editContent')} />
          <QuickLink href="/admin/prayer" label={t('dashboard.viewPrayer')} />
          {canSeeUsers && <QuickLink href="/admin/users" label={t('dashboard.manageUsers')} />}
          <QuickLink href="/admin/profile" label={t('dashboard.myProfile')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href, icon }: { label: string; value: number; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="admin-card flex flex-col gap-2 transition hover:border-[var(--admin-accent)]"
      style={{ display: 'flex' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold" style={{ color: 'var(--admin-text)' }}>{value}</span>
        <span style={{ color: 'var(--admin-accent)', opacity: 0.8 }}>{icon}</span>
      </div>
      <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{label}</span>
    </Link>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-4 py-2 text-sm transition"
      style={{
        color: 'var(--admin-text-muted)',
        border: '1px solid var(--admin-border)',
      }}
    >
      {label} →
    </Link>
  );
}
