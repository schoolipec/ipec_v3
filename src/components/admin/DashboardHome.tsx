'use client';
import { useState } from 'react';
import { Eye, Users, Smartphone, Globe2 } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';

export type VisitStats = {
  days: number;
  total: number;
  unique: number;
  byDay: { day: string; count: number }[];
  paths: { path: string; count: number }[];
  countries: { country: string | null; count: number }[];
  locales: { locale: string; count: number }[];
  devices: { device: string; count: number }[];
};

function pct(part: number, whole: number) {
  return whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`;
}

function Bar({ value, max }: { value: number; max: number }) {
  const width = max === 0 ? 0 : Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--admin-surface-2)' }}>
      <div className="h-full rounded-full" style={{ width: `${width}%`, background: 'var(--admin-accent)' }} />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-card flex flex-col gap-4">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>{title}</h2>
      {children}
    </section>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="admin-card flex items-start justify-between">
      <div>
        <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{label}</p>
        <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--admin-text)' }}>{value}</p>
      </div>
      <Icon size={18} />
    </div>
  );
}

export default function DashboardHome({ stats }: { stats: VisitStats }) {
  const { t } = useAdminLang();
  const [hover, setHover] = useState<number | null>(null);
  const maxDay = Math.max(1, ...stats.byDay.map((d) => d.count));
  const maxPath = Math.max(1, ...stats.paths.map((p) => p.count));
  const maxCountry = Math.max(1, ...stats.countries.map((c) => c.count));
  const mobile = stats.devices.find((d) => d.device === 'mobile')?.count ?? 0;
  const countryCount = stats.countries.filter((c) => c.country).length;
  const deviceLabel = (d: string) => t(`dashboard.device.${d}`);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--admin-text)' }}>{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          {t('dashboard.subtitle')} · {t('dashboard.range', { days: stats.days })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label={t('dashboard.visits')} value={stats.total} icon={Eye} />
        <Kpi label={t('dashboard.unique')} value={stats.unique} icon={Users} />
        <Kpi label={t('dashboard.mobileShare')} value={pct(mobile, stats.total)} icon={Smartphone} />
        <Kpi label={t('dashboard.countriesCount')} value={countryCount} icon={Globe2} />
      </div>

      <Card title={t('dashboard.daily')}>
        {stats.total === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('dashboard.noData')}</p>
        ) : (
          <div className="relative flex h-44 items-end gap-1">
            {stats.byDay.map((d, i) => (
              <div key={d.day} className="relative flex h-full flex-1 items-end"
                   onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <div
                  className="w-full rounded-t transition-opacity"
                  style={{
                    height: `${Math.max(d.count === 0 ? 0 : 4, (d.count / maxDay) * 100)}%`,
                    background: 'var(--admin-accent)',
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
                {hover === i && (
                  <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs"
                       style={{ background: 'var(--admin-surface-2)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' }}>
                    {d.day}: {d.count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between text-xs" style={{ color: 'var(--admin-text-faint)' }}>
          <span>{stats.byDay[0]?.day}</span>
          <span>{stats.byDay[stats.byDay.length - 1]?.day}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={t('dashboard.topPages')}>
          <ul className="flex flex-col gap-3">
            {stats.paths.length === 0 && <li className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('dashboard.noData')}</li>}
            {stats.paths.map((p) => (
              <li key={p.path} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="truncate font-mono" style={{ color: 'var(--admin-text)' }}>{p.path}</span>
                  <span style={{ color: 'var(--admin-text-muted)' }}>{p.count}</span>
                </div>
                <Bar value={p.count} max={maxPath} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('dashboard.byCountry')}>
          <ul className="flex flex-col gap-3">
            {stats.countries.length === 0 && <li className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('dashboard.noData')}</li>}
            {stats.countries.map((c) => (
              <li key={c.country ?? 'unknown'} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
                    {c.country && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/flags/${c.country.toLowerCase()}.png`} alt="" width={18} height={12}
                           className="rounded-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    {c.country ?? t('dashboard.unknown')}
                  </span>
                  <span style={{ color: 'var(--admin-text-muted)' }}>{c.count}</span>
                </div>
                <Bar value={c.count} max={maxCountry} />
              </li>
            ))}
          </ul>
          <p className="text-xs" style={{ color: 'var(--admin-text-faint)' }}>Ubicación por IP: GeoLite2 © MaxMind</p>
        </Card>

        <Card title={t('dashboard.byLanguage')}>
          <div className="flex flex-wrap gap-2">
            {stats.locales.map((l) => (
              <span key={l.locale} className="rounded-full border px-3 py-1 text-sm font-mono"
                    style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                {l.locale.toUpperCase()} · {pct(l.count, stats.total)}
              </span>
            ))}
          </div>
        </Card>

        <Card title={t('dashboard.byDevice')}>
          <ul className="flex flex-col gap-3">
            {stats.devices.map((d) => (
              <li key={d.device} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--admin-text)' }}>{deviceLabel(d.device)}</span>
                <span style={{ color: 'var(--admin-text-muted)' }}>{d.count} · {pct(d.count, stats.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
