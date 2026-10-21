'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, ChevronDown as Expand } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';

type PrayerRow = { id: string; name: string; request: string; locale: string; createdAt: string };

const LOCALE_LABEL: Record<string, string> = {
  en: 'EN', es: 'ES', pt: 'PT', ko: 'KO', de: 'DE',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PrayerTable() {
  const { t } = useAdminLang();
  const [rows, setRows] = useState<PrayerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Carga todo para paginación en cliente (los pedidos de una iglesia son pocos)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/prayer?page=1&limit=500');
      if (!res.ok) return;
      const data = await res.json();
      setRows(data.rows);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = useMemo<ColumnDef<PrayerRow>[]>(() => [
    {
      accessorKey: 'name',
      header: t('prayer.colName'),
      cell: ({ getValue }) => (
        <span className="font-medium" style={{ color: 'var(--admin-text)' }}>{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'locale',
      header: t('prayer.colLang'),
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-mono"
          style={{ color: 'var(--admin-text-muted)', borderColor: 'var(--admin-border)' }}>
          {LOCALE_LABEL[getValue<string>()] ?? getValue<string>().toUpperCase()}
        </span>
      ),
      enableGlobalFilter: false,
    },
    {
      accessorKey: 'createdAt',
      header: t('prayer.colDate'),
      cell: ({ getValue }) => (
        <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{formatDate(getValue<string>())}</span>
      ),
      enableGlobalFilter: false,
    },
    {
      id: 'expand',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => setExpanded(e => e === row.original.id ? null : row.original.id)}
          className="flex items-center gap-1 text-xs transition"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          {t('prayer.viewRequest')}
          <Expand size={13} className={`transition-transform ${expanded === row.original.id ? 'rotate-180' : ''}`} />
        </button>
      ),
      enableSorting: false,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, expanded]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-text-muted)' }} />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={t('prayer.searchName')}
            className="admin-input w-full pl-9"
          />
        </div>
        <span className="text-sm shrink-0" style={{ color: 'var(--admin-text-muted)' }}>
          {total} {t('prayer.total')}
        </span>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('common.loading')}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                          style={{ color: 'var(--admin-text-muted)' }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            header.column.getIsSorted() === 'asc' ? <ChevronUp size={13} /> :
                            header.column.getIsSorted() === 'desc' ? <ChevronDown size={13} /> :
                            <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10" style={{ color: 'var(--admin-text-muted)' }}>
                    {t('prayer.noRequests')}
                  </td>
                </tr>
              ) : table.getRowModel().rows.map(row => (
                <>
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                  {expanded === row.original.id && (
                    <tr key={`${row.id}-exp`}>
                      <td colSpan={columns.length} className="pb-4 px-4">
                        <div className="rounded-lg p-3" style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }}>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--admin-text)' }}>
                            {row.original.request}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="admin-pagination">
        <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          {table.getFilteredRowModel().rows.length} {t('prayer.results')}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="admin-page-btn">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm" style={{ color: 'var(--admin-text)' }}>
            {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="admin-page-btn">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
