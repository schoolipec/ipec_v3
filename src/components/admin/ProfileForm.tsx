'use client';
import { useState, FormEvent } from 'react';
import { Phone, MessageCircle, Send, Mail, KeyRound, User } from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';
import type { Role } from '@prisma/client';

type ProfileData = {
  name: string; email: string; role: Role;
  phone: string; whatsapp: string; telegramChatId: string;
  notifyTelegram: boolean; notifyEmail: boolean;
};

const ROLE_LABEL: Record<Role, string> = { SUPERADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'User' };

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const { t } = useAdminLang();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [telegramChatId, setTelegramChatId] = useState(initial.telegramChatId);
  const [notifyTelegram, setNotifyTelegram] = useState(initial.notifyTelegram);
  const [notifyEmail, setNotifyEmail] = useState(initial.notifyEmail);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPwd && newPwd !== confirmPwd) {
      setMsg({ type: 'err', text: t('profile.errors.mismatch') });
      return;
    }

    const body: Record<string, unknown> = {
      name, phone, whatsapp, telegramChatId, notifyTelegram, notifyEmail,
    };
    if (email !== initial.email) body.email = email;
    if (newPwd) body.newPassword = newPwd;
    if (body.email || body.newPassword) body.currentPassword = currentPwd;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMsg({ type: 'ok', text: t('profile.saved') });
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        const data = await res.json().catch(() => ({}));
        setMsg({ type: 'err', text: data.error ? t(`profile.errors.${data.error}`) : t('profile.errors.generic') });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-5xl flex-col gap-6">
      {/* Encabezado */}
      <div className="admin-card flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="admin-avatar h-14 w-14 text-lg">{initials(name || initial.name)}</div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--admin-text)' }}>{name || initial.name}</h1>
          <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{email}</p>
        </div>
        <span className="admin-role-badge self-start sm:self-center">{ROLE_LABEL[initial.role]}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section icon={User} title={t('profile.personal')} desc={t('profile.personalDesc')}>
          <Field label={t('users.name')} id="name">
            <input id="name" className="admin-input" value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <Field label={t('profile.email')} id="email" hint={t('profile.emailNote')}>
            <input id="email" type="email" className="admin-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </Field>
        </Section>

        <Section icon={Phone} title={t('profile.contact')} desc={t('profile.contactDesc')}>
          <Field label={t('users.phone')} id="phone">
            <input id="phone" className="admin-input" value={phone} onChange={e => setPhone(e.target.value)} />
          </Field>
          <Field label={t('users.whatsapp')} id="whatsapp">
            <input id="whatsapp" className="admin-input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </Field>
        </Section>

        <Section icon={Send} title={t('profile.telegram')} desc={t('profile.telegramDesc')}>
          <Field label={t('users.telegramChatId')} id="telegram">
            <input id="telegram" inputMode="numeric" className="admin-input" value={telegramChatId}
              onChange={e => setTelegramChatId(e.target.value)} />
          </Field>
        </Section>

        <Section icon={MessageCircle} title={t('profile.notifications')} desc={t('profile.notificationsDesc')}>
          <Toggle checked={notifyTelegram} onChange={setNotifyTelegram} label={t('users.notifyTelegram')} icon={Send} />
          <Toggle checked={notifyEmail} onChange={setNotifyEmail} label={t('users.notifyEmail')} icon={Mail} />
          <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('profile.emailCopyHint')}</p>
        </Section>

        <Section icon={KeyRound} title={t('profile.password')} desc={t('profile.passwordDesc')} className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label={t('profile.currentPassword')} id="currentPwd">
              <input id="currentPwd" type="password" autoComplete="current-password" className="admin-input"
                value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
            </Field>
            <Field label={t('profile.newPassword')} id="newPwd">
              <input id="newPwd" type="password" autoComplete="new-password" className="admin-input"
                value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </Field>
            <Field label={t('profile.confirmPassword')} id="confirmPwd">
              <input id="confirmPwd" type="password" autoComplete="new-password" className="admin-input"
                value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
            </Field>
          </div>
        </Section>
      </div>

      {msg && (
        <p className="rounded-lg px-4 py-2.5 text-sm"
           style={msg.type === 'ok'
             ? { background: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }
             : { background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>
          {msg.text}
        </p>
      )}

      <div>
        <button type="submit" disabled={saving} className="admin-btn px-6 py-2.5">
          {saving ? t('profile.saving') : t('profile.saveChanges')}
        </button>
      </div>
    </form>
  );
}

function Section({ icon: Icon, title, desc, children, className = '' }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string; desc: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`admin-card flex flex-col gap-4 ${className}`}>
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'var(--admin-accent-bg)', color: 'var(--admin-accent)' }}>
          <Icon size={16} />
        </span>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>{title}</h2>
          <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{desc}</p>
        </div>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium" style={{ color: 'var(--admin-text-muted)' }}>{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: 'var(--admin-text-faint)' }}>{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, icon: Icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5"
           style={{ border: '1px solid var(--admin-border)' }}>
      <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
        <Icon size={14} />
        {label}
      </span>
      <input type="checkbox" className="accent-[var(--admin-accent)] h-4 w-4" checked={checked}
             onChange={e => onChange(e.target.checked)} />
    </label>
  );
}
