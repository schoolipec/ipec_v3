'use client';
import { useState, useEffect, useCallback } from 'react';
import { Mail, Send, Reply, Trash2, PenSquare, Paperclip, RefreshCw } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';

type Summary = { uid: number; from: string; to: string; subject: string; date: string; seen: boolean };
type Detail = {
  uid: number; from: string; to: string; cc: string; subject: string; date: string; messageId: string;
  html: string; text: string; attachments: { index: number; filename: string; size: number; contentType: string }[];
};
type Mode = { kind: 'read' } | { kind: 'compose' } | { kind: 'reply' };

export default function MailsPanel() {
  const { t, lang } = useAdminLang();
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [rows, setRows] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Detail | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'read' });
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/mails?folder=${folder}&page=${page}`);
      const data = await res.json();
      if (!res.ok) { setError(res.status === 503 ? t('mails.notConfigured') : t('mails.serverError')); return; }
      setRows(data.rows);
      setPages(data.pages);
    } finally { setLoading(false); }
  }, [folder, page, t]);

  useEffect(() => { load(); }, [load]);

  async function open(uid: number) {
    setStatus('');
    const res = await fetch(`/api/admin/mails/${uid}`);
    if (!res.ok) { setError(t('mails.serverError')); return; }
    setSelected(await res.json());
    setMode({ kind: 'read' });
    setRows(prev => prev.map(r => r.uid === uid ? { ...r, seen: true } : r));
  }

  function startCompose() {
    setSelected(null);
    setTo(''); setSubject(''); setBody('');
    setMode({ kind: 'compose' });
    setStatus('');
  }

  function startReply(d: Detail) {
    setTo(d.from);
    setSubject(d.subject.toLowerCase().startsWith('re:') ? d.subject : `Re: ${d.subject}`);
    setBody(`\n\n— ${new Date(d.date).toLocaleString(lang === 'es' ? 'es' : 'en-US')}, ${d.from}:\n${d.text.split('\n').map(l => `> ${l}`).join('\n')}`);
    setMode({ kind: 'reply' });
    setStatus('');
  }

  async function send() {
    setSending(true);
    setStatus('');
    try {
      const payload: Record<string, unknown> = { to, subject, text: body };
      if (mode.kind === 'reply' && selected) {
        payload.inReplyTo = { messageId: selected.messageId, references: selected.messageId };
      }
      const res = await fetch('/api/admin/mails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { setStatus(t('mails.sendError')); return; }
      setStatus(t('mails.sent'));
      setMode({ kind: 'read' });
      setSelected(null);
      setTo(''); setSubject(''); setBody('');
      if (folder === 'sent') load();
    } finally { setSending(false); }
  }

  async function remove(uid: number) {
    if (!confirm(t('mails.confirmDelete'))) return;
    const res = await fetch(`/api/admin/mails/${uid}`, { method: 'DELETE' });
    if (!res.ok) { setError(t('mails.serverError')); return; }
    setRows(prev => prev.filter(r => r.uid !== uid));
    setSelected(null);
  }

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(lang === 'es' ? 'es' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['inbox', 'sent'] as const).map((f) => (
            <button key={f} onClick={() => { setFolder(f); setPage(1); setSelected(null); setMode({ kind: 'read' }); }}
              className={`rounded-lg px-3 py-1.5 text-sm ${folder === f ? 'bg-green-700/30 text-green-300' : 'text-slate-400 hover:text-slate-200'}`}>
              {f === 'inbox' ? t('mails.inbox') : t('mails.sentFolder')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm" style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)' }}><RefreshCw size={14} />{t('mails.refresh')}</button>
          <button onClick={startCompose} className="admin-btn flex items-center gap-1.5 text-sm"><PenSquare size={14} />{t('mails.compose')}</button>
        </div>
      </div>

      {status && <p className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>{status}</p>}
      {error && <p className="rounded-lg px-4 py-2 text-sm" style={{ background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Lista */}
        <div className="admin-card flex flex-col p-0">
          {loading && <p className="p-4 text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('common.loading')}</p>}
          {!loading && rows.length === 0 && <p className="p-6 text-center text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('mails.empty')}</p>}
          <ul className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
            {rows.map((r) => (
              <li key={r.uid}>
                <button onClick={() => open(r.uid)} className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-slate-800/40">
                  <span className="flex items-center justify-between gap-2 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                    <span className="truncate">{folder === 'inbox' ? r.from : `→ ${r.to}`}</span>
                    <span className="shrink-0">{fmtDate(r.date)}</span>
                  </span>
                  <span className={`truncate text-sm ${!r.seen && folder === 'inbox' ? 'font-semibold' : ''}`} style={{ color: 'var(--admin-text)' }}>
                    {!r.seen && folder === 'inbox' && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-400 align-middle" />}
                    {r.subject}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-2 text-sm" style={{ borderColor: 'var(--admin-border)' }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="admin-page-btn">‹</button>
              <span style={{ color: 'var(--admin-text-muted)' }}>{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="admin-page-btn">›</button>
            </div>
          )}
        </div>

        {/* Lector / redactor */}
        <div className="admin-card min-h-[320px]">
          {mode.kind === 'compose' || mode.kind === 'reply' ? (
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold" style={{ color: 'var(--admin-text)' }}>{mode.kind === 'reply' ? t('mails.reply') : t('mails.compose')}</h2>
              <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('mails.to')}
                <input className="admin-input" value={to} onChange={e => setTo(e.target.value)} type="email" />
              </label>
              <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('mails.subject')}
                <input className="admin-input" value={subject} onChange={e => setSubject(e.target.value)} maxLength={200} />
              </label>
              <label className="flex flex-col gap-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('mails.body')}
                <textarea className="admin-input min-h-[220px]" value={body} onChange={e => setBody(e.target.value)} />
              </label>
              <div className="flex gap-2">
                <button onClick={send} disabled={sending || !to || !subject || !body.trim()} className="admin-btn flex items-center gap-1.5"><Send size={14} />{sending ? t('common.sending') : t('mails.send')}</button>
                <button onClick={() => setMode({ kind: 'read' })} className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('common.cancel')}</button>
              </div>
            </div>
          ) : selected ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--admin-text)' }}>{selected.subject}</h2>
                <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('mails.from')}: {selected.from}</p>
                <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('mails.to')}: {selected.to}</p>
                <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{fmtDate(selected.date)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startReply(selected)} className="admin-btn flex items-center gap-1.5 text-sm"><Reply size={14} />{t('mails.reply')}</button>
                <button onClick={() => remove(selected.uid)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm" style={{ color: 'var(--admin-danger)', border: '1px solid var(--admin-border)' }}><Trash2 size={14} />{t('mails.delete')}</button>
              </div>
              {selected.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.attachments.map((a) => (
                    <a key={a.index} href={`/api/admin/mails/${selected.uid}/attachments/${a.index}`}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs" style={{ border: '1px solid var(--admin-border)', color: 'var(--admin-text)' }}>
                      <Paperclip size={12} />{a.filename}
                    </a>
                  ))}
                </div>
              )}
              <div className="rounded-lg p-4 text-sm leading-relaxed" style={{ background: 'var(--admin-surface-2)', color: 'var(--admin-text)' }}>
                {selected.html
                  ? <div dangerouslySetInnerHTML={{ __html: selected.html }} />
                  : <pre className="whitespace-pre-wrap font-sans">{selected.text}</pre>}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              <Mail size={28} />
              {t('mails.pickOne')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
