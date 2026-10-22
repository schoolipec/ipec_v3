'use client';
import { Fragment, useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';

type PrayerStatus = 'NEW' | 'DOWNLOADED';
type PrayerRow = { id: string; name: string; request: string; locale: string; status: PrayerStatus; createdAt: string };
type Response = {
  rows: PrayerRow[]; total: number; pages: number; page: number;
  countByStatus: Record<PrayerStatus, number>;
};

const STATUSES: PrayerStatus[] = ['NEW', 'DOWNLOADED'];
const STATUS_STYLE: Record<PrayerStatus, string> = {
  NEW: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  DOWNLOADED: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === 'es' ? 'es' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function PrayerTable() {
  const { t, lang } = useAdminLang();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PrayerStatus | ''>('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      if (q) params.set('q', q);
      const res = await fetch(`/api/admin/prayer?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => { load(); }, [load]);

  // Búsqueda con retardo para no pedir al servidor en cada tecla
  useEffect(() => {
    const id = setTimeout(() => { setPage(1); setQ(search.trim()); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  async function exportQuelea() {
    setExporting(true);
    setExportMsg('');
    try {
      const res = await fetch('/api/admin/prayer/export-quelea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, q }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setExportMsg(err.error === 'no_results' ? t('prayer.exportNoResults') : t('prayer.exportError'));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'peticiones-quelea.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function changeStatus(id: string, next: PrayerStatus) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/prayer/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) await load();
    } finally {
      setSavingId(null);
    }
  }

  const counts = data?.countByStatus;
  const totalAll = counts ? STATUSES.reduce((sum, s) => sum + counts[s], 0) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--admin-text)' }}>{t('prayer.title')}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('prayer.subtitle')}</p>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...STATUSES] as const).map((s) => {
          const active = status === s;
          const count = s === '' ? totalAll : counts?.[s] ?? 0;
          return (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition"
              style={{
                borderColor: active ? 'var(--admin-accent)' : 'var(--admin-border)',
                background: active ? 'var(--admin-accent-bg)' : 'transparent',
                color: active ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
              }}
            >
              {s === '' ? t('prayer.all') : t(`prayer.status.${s}`)}
              <span className="font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Búsqueda */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder={t('prayer.searchName')} className="admin-input w-full pl-9" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            {data?.total ?? 0} {t('prayer.results')}
          </span>
          <button onClick={exportQuelea} disabled={exporting || !counts || counts.NEW === 0} className="admin-btn text-xs py-1.5 px-3">
            {exporting ? t('prayer.exporting') : t('prayer.exportQuelea')}
          </button>
        </div>
      </div>
      <p className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'var(--admin-accent-bg)', color: 'var(--admin-text)' }}>{t('prayer.exportNotice')}</p>
      {exportMsg && (
        <p className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>{exportMsg}</p>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('prayer.colName')}</th>
              <th>{t('prayer.colStatus')}</th>
              <th>{t('prayer.colLang')}</th>
              <th>{t('prayer.colDate')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('common.loading')}</td></tr>
            )}
            {data && data.rows.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('prayer.noRequests')}</td></tr>
            )}
            {data?.rows.map((row) => (
              <Fragment key={row.id}>
                <tr>
                  <td className="font-medium" style={{ color: 'var(--admin-text)' }}>{row.name}</td>
                  <td>
                    <div className="relative inline-flex items-center">
                      <select
                        value={row.status}
                        disabled={savingId === row.id}
                        onChange={(e) => changeStatus(row.id, e.target.value as PrayerStatus)}
                        aria-label={t('prayer.changeStatus')}
                        className={`appearance-none rounded-full border py-0.5 pl-3 pr-7 text-xs font-medium ${STATUS_STYLE[row.status]}`}
                        style={{ background: 'transparent' }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} style={{ color: '#0f172a' }}>{t(`prayer.status.${s}`)}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="pointer-events-none absolute right-2" />
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-mono"
                          style={{ color: 'var(--admin-text-muted)', borderColor: 'var(--admin-border)' }}>
                      {row.locale.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{formatDate(row.createdAt, lang)}</td>
                  <td className="text-right">
                    <button onClick={() => setExpanded((e) => (e === row.id ? null : row.id))}
                            className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      {t('prayer.viewRequest')}
                    </button>
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr>
                    <td colSpan={5} className="pb-4 px-4">
                      <div className="rounded-lg p-3" style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--admin-text)' }}>{row.request}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {data && (
        <div className="admin-pagination">
          <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            {t('prayer.page')} {data.page} {t('prayer.of')} {data.pages}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.page <= 1} className="admin-page-btn">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={data.page >= data.pages} className="admin-page-btn">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

