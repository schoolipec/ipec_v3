'use client';
import { useState, useEffect, useCallback } from 'react';

type PrayerRow = { id: string; name: string; request: string; locale: string; createdAt: string };

const LOCALE_FLAG: Record<string, string> = {
  en: '🇺🇸', es: '🇪🇸', pt: '🇧🇷', ko: '🇰🇷', de: '🇩🇪',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PrayerTable() {
  const [rows, setRows] = useState<PrayerRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prayer?page=${p}`);
      if (!res.ok) return;
      const data = await res.json();
      setRows(data.rows);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-400">{total} pedido{total !== 1 ? 's' : ''} en total</p>

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      {!loading && rows.length === 0 && (
        <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-500">
          No hay pedidos de oración todavía.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map(row => (
          <div key={row.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-100">{row.name}</span>
                  <span className="text-lg" title={row.locale}>{LOCALE_FLAG[row.locale] ?? '🌐'}</span>
                </div>
                <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
              </div>
              <button
                onClick={() => setExpanded(e => e === row.id ? null : row.id)}
                className="shrink-0 text-xs text-slate-500 hover:text-slate-300"
              >
                {expanded === row.id ? 'Ocultar' : 'Ver petición'}
              </button>
            </div>
            {expanded === row.id && (
              <p className="mt-3 rounded-lg bg-slate-800 px-3 py-2.5 text-sm text-slate-300 leading-relaxed">
                {row.request}
              </p>
            )}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => load(page - 1)} disabled={page <= 1}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 disabled:opacity-40 hover:text-slate-100">
            ← Anterior
          </button>
          <span className="text-sm text-slate-400">Página {page} de {pages}</span>
          <button onClick={() => load(page + 1)} disabled={page >= pages}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 disabled:opacity-40 hover:text-slate-100">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
