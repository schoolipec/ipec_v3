'use client';
import { Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Search, UserPlus,
  Trash2, Settings, Pencil, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import type { Role } from '@prisma/client';

type UserRow = {
  id: string; email: string; name: string; role: Role;
  permissions: Record<string, boolean>;
  phone: string | null; whatsapp: string | null; telegramChatId: string | null;
  notifyTelegram: boolean; notifyEmail: boolean; createdAt: string;
};

const ROLE_BADGE: Record<Role, string> = {
  SUPERADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ADMIN: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  USER: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};
const ROLE_LABEL: Record<Role, string> = { SUPERADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'User' };
const SECTIONS = ['hero', 'about', 'groups', 'pastors', 'contact', 'live', 'offering', 'social'];
const SECTION_LABEL: Record<string, string> = {
  hero: 'Hero', about: 'About', groups: 'Groups', pastors: 'Pastors',
  contact: 'Contact', live: 'Live', offering: 'Offering', social: 'Social',
};

export default function UsersPanel({ currentRole, currentId }: { currentRole: Role; currentId: string }) {
  const { t } = useAdminLang();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [permOpen, setPermOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invName, setInvName] = useState('');
  const [invRole, setInvRole] = useState<Role>('USER');
  const [invError, setInvError] = useState('');
  const [invLoading, setInvLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function sendInvitation() {
    setInvError(''); setInvLoading(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invEmail, name: invName, role: invRole }),
      });
      const data = await res.json();
      if (!res.ok) { setInvError(data.error ?? 'Error'); return; }
      setInviteLink(data.link);
      setInvEmail(''); setInvName(''); setInvRole('USER');
    } finally { setInvLoading(false); }
  }

  async function savePermissions(userId: string, perms: Record<string, boolean>) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, permissions: perms }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: perms } : u));
    setPermOpen(null);
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`${t('users.confirmDelete')} ${name}?`)) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId));
  }

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  }

  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      accessorKey: 'name',
      header: t('users.colName'),
      cell: ({ row }) => (
        <div>
          <div className="font-medium" style={{ color: 'var(--admin-text)' }}>{row.original.name}</div>
          <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: t('users.colRole'),
      cell: ({ getValue }) => {
        const r = getValue<Role>();
        return (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[r]}`}>
            {ROLE_LABEL[r]}
          </span>
        );
      },
    },
    {
      id: 'contact',
      header: t('users.colContact'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
          {row.original.telegramChatId && <div>Telegram: {row.original.telegramChatId}</div>}
          {row.original.phone && <div>{row.original.phone}</div>}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        const canEdit = currentRole === 'SUPERADMIN' || u.role !== 'SUPERADMIN';
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => canEdit ? setEditing(u) : flash(t('users.cannotEditSuper'))}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs transition"
              style={{ color: 'var(--admin-text-muted)', border: '1px solid var(--admin-border)', opacity: canEdit ? 1 : 0.5 }}
            >
              <Pencil size={13} />
              <span className="hidden sm:inline">{t('users.edit')}</span>
            </button>
            {u.role === 'USER' && (
              <button
                onClick={() => setPermOpen(p => p === u.id ? null : u.id)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs transition"
                style={{ color: 'var(--admin-text-muted)', border: '1px solid var(--admin-border)' }}
                title={t('users.permissions')}
              >
                <Settings size={13} />
                <span className="hidden sm:inline">{t('users.permissions')}</span>
              </button>
            )}
            {currentRole === 'SUPERADMIN' && u.id !== currentId && (
              <button
                onClick={() => deleteUser(u.id, u.name)}
                className="flex items-center rounded-md p-1.5 transition"
                style={{ color: 'var(--admin-danger, #f87171)' }}
                title={t('users.delete')}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, currentRole, currentId]);

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-text-muted)' }} />
          <input value={globalFilter} onChange={e => setGlobalFilter(e.target.value)}
                 placeholder={t('common.search')} className="admin-input w-full pl-9" />
        </div>
        <button onClick={() => { setInviteOpen(!inviteOpen); setInviteLink(''); }} className="admin-btn flex items-center gap-2">
          <UserPlus size={15} />
          {t('users.invite')}
        </button>
      </div>

      {notice && (
        <p className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>{notice}</p>
      )}

      {inviteOpen && (
        <div className="admin-card">
          <h3 className="mb-4 font-semibold" style={{ color: 'var(--admin-text)' }}>{t('users.newInvitation')}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('users.email')}</label>
              <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)}
                className="admin-input" placeholder="correo@ejemplo.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('users.name')}</label>
              <input type="text" value={invName} onChange={e => setInvName(e.target.value)}
                className="admin-input" placeholder={t('users.fullName')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('users.role')}</label>
              <select value={invRole} onChange={e => setInvRole(e.target.value as Role)} className="admin-input">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                {currentRole === 'SUPERADMIN' && <option value="SUPERADMIN">Super Admin</option>}
              </select>
            </div>
          </div>
          {invError && <p className="mt-2 text-sm" style={{ color: 'var(--admin-danger, #f87171)' }}>{invError}</p>}
          {inviteLink && (
            <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }}>
              <p className="mb-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('users.inviteLink72h')}</p>
              <p className="break-all text-sm" style={{ color: 'var(--admin-accent)' }}>{inviteLink}</p>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <button onClick={sendInvitation} disabled={invLoading || !invEmail || !invName} className="admin-btn">
              {invLoading ? t('common.sending') : t('users.generateLink')}
            </button>
            <button onClick={() => setInviteOpen(false)} className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

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
                  <td colSpan={columns.length} className="text-center py-8" style={{ color: 'var(--admin-text-muted)' }}>
                    {t('users.noResults')}
                  </td>
                </tr>
              ) : table.getRowModel().rows.map(row => (
                <Fragment key={row.id}>
                  <tr>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                  {permOpen === row.original.id && row.original.role === 'USER' && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 pb-4">
                        <PermissionsEditor
                          initial={row.original.permissions}
                          onSave={(perms) => savePermissions(row.original.id, perms)}
                          onCancel={() => setPermOpen(null)}
                          t={t}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-pagination">
        <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
          {table.getFilteredRowModel().rows.length} {t('users.total')}
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

      {editing && (
        <EditUserDialog
          user={editing}
          currentRole={currentRole}
          isSelf={editing.id === currentId}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); flash(t('users.saved')); loadUsers(); }}
          t={t}
        />
      )}
    </div>
  );
}


function EditUserDialog({ user, currentRole, isSelf, onClose, onSaved, t }: {
  user: UserRow;
  currentRole: Role;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
  t: (key: string) => string;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp ?? '');
  const [telegramChatId, setTelegramChatId] = useState(user.telegramChatId ?? '');
  const [notifyTelegram, setNotifyTelegram] = useState(user.notifyTelegram);
  const [notifyEmail, setNotifyEmail] = useState(user.notifyEmail);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setError(''); setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, phone, whatsapp, telegramChatId, notifyTelegram, notifyEmail }),
      });
      if (res.ok) { onSaved(); return; }
      const data = await res.json().catch(() => ({}));
      setError(data.error === 'email_taken' ? t('users.emailTaken') : (data.error ?? 'Error'));
    } finally { setSaving(false); }
  }

  const input = 'admin-input w-full';
  const label = 'text-xs font-medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.6)' }}
         onClick={onClose}>
      <div className="admin-card w-full max-w-xl max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>{t('users.editUser')}</h3>
          <button onClick={onClose} aria-label="close" style={{ color: 'var(--admin-text-muted)' }}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: 'var(--admin-text-muted)' }}>{t('users.name')}</label>
            <input className={input} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: 'var(--admin-text-muted)' }}>{t('users.email')}</label>
            <input className={input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: 'var(--admin-text-muted)' }}>{t('users.role')}</label>
            <select className={input} value={role} disabled={isSelf} onChange={e => setRole(e.target.value as Role)}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              {currentRole === 'SUPERADMIN' && <option value="SUPERADMIN">Super Admin</option>}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: 'var(--admin-text-muted)' }}>{t('users.phone')}</label>
            <input className={input} value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: 'var(--admin-text-muted)' }}>{t('users.whatsapp')}</label>
            <input className={input} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label} style={{ color: 'var(--admin-text-muted)' }}>{t('users.telegramChatId')}</label>
            <input className={input} inputMode="numeric" value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 text-sm" style={{ color: 'var(--admin-text)' }}>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" className="accent-[var(--admin-accent)]" checked={notifyTelegram} onChange={e => setNotifyTelegram(e.target.checked)} />
            {t('users.notifyTelegram')}
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" className="accent-[var(--admin-accent)]" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} />
            {t('users.notifyEmail')}
          </label>
        </div>

        {error && <p className="mt-4 text-sm" style={{ color: 'var(--admin-danger, #f87171)' }}>{error}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('common.cancel')}</button>
          <button onClick={save} disabled={saving} className="admin-btn">
            {saving ? t('common.sending') : t('users.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionsEditor({ initial, onSave, onCancel, t }: {
  initial: Record<string, boolean>;
  onSave: (p: Record<string, boolean>) => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const [perms, setPerms] = useState({ ...initial });
  return (
    <div className="rounded-lg p-3 mt-1" style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }}>
      <p className="mb-3 text-xs font-medium" style={{ color: 'var(--admin-text-muted)' }}>{t('users.sectionsCanEdit')}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SECTIONS.map(s => (
          <label key={s} className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
            <input type="checkbox" checked={!!perms[s]} onChange={() => setPerms(p => ({ ...p, [s]: !p[s] }))}
              className="accent-[var(--admin-accent)]" />
            {SECTION_LABEL[s]}
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-3">
        <button onClick={() => onSave(perms)} className="admin-btn text-xs py-1.5 px-3">{t('users.savePermissions')}</button>
        <button onClick={onCancel} className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('common.cancel')}</button>
      </div>
    </div>
  );
}
