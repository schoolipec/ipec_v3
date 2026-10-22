'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Role } from '@prisma/client';
import type { SiteSection } from '@/server/auth';

type Entry = { id: string; section: string; key: string; locale: string; value: string; updatedAt: string; updatedBy: string | null };

const LOCALES = ['en', 'es', 'pt', 'ko', 'de', 'all'] as const;
const LOCALE_LABEL: Record<string, string> = {
  en: 'English', es: 'Español', pt: 'Português', ko: '한국어', de: 'Deutsch', all: 'Todos los idiomas',
};

const SECTION_LABEL: Record<string, string> = {
  hero: 'Hero / Bienvenida',
  about: 'Acerca de',
  groups: 'Grupos',
  pastors: 'Pastores',
  contact: 'Contáctanos',
  live: 'En vivo',
  offering: 'Ofrendas',
  social: 'Redes sociales',
  site: 'Datos del sitio',
};

export default function ContentEditor({
  userRole,
  userPermissions,
  sections,
}: {
  userRole: Role;
  userPermissions: Record<string, boolean>;
  sections: string[];
}) {
  const canEditSection = (s: string) =>
    userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userPermissions[s] === true;

  const allSections = [...sections, 'site'];
  const accessibleSections = allSections.filter(canEditSection);

  const [activeSection, setActiveSection] = useState(accessibleSections[0] ?? '');
  const [activeLocale, setActiveLocale] = useState('en');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

  const loadEntries = useCallback(async () => {
    if (!activeSection) return;
    setLoadError('');
    try {
      const loc = activeSection === 'site' ? 'all' : activeLocale;
      const res = await fetch(`/api/admin/content?section=${activeSection}&locale=${loc}`);
      if (!res.ok) throw new Error('Error al cargar');
      const data: Entry[] = await res.json();
      setEntries(data);
      setEdits({});
    } catch {
      setLoadError('No se pudo cargar el contenido.');
    }
  }, [activeSection, activeLocale]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  async function saveEntry(id: string) {
    const value = edits[id];
    if (value === undefined) return;
    setSaving(id);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      setSaved(id);
      setTimeout(() => setSaved(s => s === id ? null : s), 2000);
      // Actualizar la entrada local
      setEntries(prev => prev.map(e => e.id === id ? { ...e, value } : e));
    } finally {
      setSaving(null);
    }
  }

  const localesForSection = activeSection === 'site' ? ['all'] : LOCALES.filter(l => l !== 'all');

  if (accessibleSections.length === 0) {
    return <p className="text-slate-400">No tienes permiso para editar ninguna sección.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs de sección */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {accessibleSections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              activeSection === s
                ? 'bg-green-700/20 text-green-400 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {SECTION_LABEL[s] ?? s}
          </button>
        ))}
      </div>

      {/* Tabs de idioma */}
      {activeSection !== 'site' && (
        <div className="flex flex-wrap gap-2">
          {localesForSection.map(l => (
            <button key={l} onClick={() => setActiveLocale(l)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                activeLocale === l
                  ? 'bg-slate-700 text-slate-100 font-medium'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {LOCALE_LABEL[l]}
            </button>
          ))}
        </div>
      )}

      {loadError && <p className="text-sm text-red-400">{loadError}</p>}

      {/* Entradas */}
      <div className="flex flex-col gap-3">
        {entries.length === 0 && !loadError && (
          <p className="text-sm text-slate-500">No hay entradas para esta sección e idioma.</p>
        )}
        {entries.map(entry => {
          const current = edits[entry.id] ?? entry.value;
          const dirty = edits[entry.id] !== undefined && edits[entry.id] !== entry.value;
          const isLong = entry.value.length > 80;

          return (
            <div key={entry.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <code className="text-xs text-slate-500">{entry.section}.{entry.key}</code>
                {entry.updatedBy && (
                  <span className="text-xs text-slate-600">
                    Editado por {entry.updatedBy}
                  </span>
                )}
              </div>
              {/image$/i.test(entry.key) ? (
                <ImageField
                  currentSrc={entry.value}
                  disabled={saving === entry.id}
                  onUploaded={(value) => {
                    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, value } : e));
                    setSaved(entry.id);
                    setTimeout(() => setSaved(s => s === entry.id ? null : s), 2000);
                  }}
                  entryId={entry.id}
                />
              ) : isLong ? (
                <textarea
                  rows={3}
                  value={current}
                  onChange={e => setEdits(prev => ({ ...prev, [entry.id]: e.target.value }))}
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              ) : (
                <input
                  type="text"
                  value={current}
                  onChange={e => setEdits(prev => ({ ...prev, [entry.id]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              )}
              <div className="mt-2 flex items-center gap-3">
                {!/image$/i.test(entry.key) && (
                <button
                  onClick={() => saveEntry(entry.id)}
                  disabled={!dirty || saving === entry.id}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-40"
                >
                  {saving === entry.id ? 'Guardando…' : 'Guardar'}
                </button>
                )}
                {saved === entry.id && (
                  <span className="text-xs text-green-400">✓ Publicado</span>
                )}
                {dirty && saving !== entry.id && (
                  <span className="text-xs text-amber-400">Sin guardar</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';

function ImageField({ entryId, currentSrc, disabled, onUploaded }: {
  entryId: string;
  currentSrc: string;
  disabled: boolean;
  onUploaded: (value: string) => void;
}) {
  const [over, setOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  async function upload(file: File) {
    setError('');
    if (!IMAGE_ACCEPT.split(',').includes(file.type)) {
      setError('Formato no permitido. Usa PNG, JPG o WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen supera 5 MB.');
      return;
    }
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('entryId', entryId);
      const res = await fetch('/api/admin/media', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === 'forbidden' ? 'No tienes permiso para esta sección.' : 'No se pudo subir la imagen.');
        return;
      }
      onUploaded(data.value);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !disabled && !uploading) upload(file);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start">
      <div className="h-32 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-800 md:w-56 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview ?? currentSrc} alt="" className="h-full w-full object-cover" />
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onClick={() => { if (!uploading) document.getElementById(`file-${entryId}`)?.click(); }}
        className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition ${
          over ? 'border-green-500 bg-green-500/10 text-green-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'
        }`}
      >
        <span>{uploading ? 'Subiendo imagen…' : 'Arrastra una imagen aquí o haz clic para elegirla'}</span>
        <span className="text-xs text-slate-500">PNG, JPG o WebP · máximo 5 MB</span>
        <input
          id={`file-${entryId}`}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
        />
      </div>
      {error && <p className="text-xs text-red-400 md:self-center">{error}</p>}
    </div>
  );
}
