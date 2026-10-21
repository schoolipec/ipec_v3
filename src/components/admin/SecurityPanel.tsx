'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  Shield, ShieldCheck, ShieldOff, Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useAdminLang } from '@/components/admin/AdminLangContext';

interface Props {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

const TIMEOUT_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 h' },
  { value: 120, label: '2 h' },
  { value: 240, label: '4 h' },
  { value: 480, label: '8 h' },
  { value: 0, label: 'Never' },
];

export default function SecurityPanel({ twoFactorEnabled: initial2FA, sessionTimeout: initialTimeout }: Props) {
  const { t } = useAdminLang();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initial2FA);
  const [sessionTimeout, setSessionTimeout] = useState(initialTimeout);

  // 2FA setup flow
  const [setupStep, setSetupStep] = useState<'idle' | 'scan' | 'verify' | 'done'>('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function start2FASetup() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/security/2fa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); return; }
      setQrUrl(data.otpAuthUrl);
      setSecret(data.secret);
      setSetupStep('scan');
    } finally { setSaving(false); }
  }

  async function verify2FA() {
    if (!code || code.length < 6) return;
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error === 'invalid_code' ? t('security.invalidCode') : data.error); return; }
      setTwoFactorEnabled(true);
      setSetupStep('done');
    } finally { setSaving(false); }
  }

  async function disable2FA() {
    if (!confirm(t('security.confirmDisable2FA'))) return;
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/security/2fa', { method: 'DELETE' });
      if (!res.ok) { setError('Error'); return; }
      setTwoFactorEnabled(false);
      setSetupStep('idle');
    } finally { setSaving(false); }
  }

  async function saveSessionTimeout(val: number) {
    setSessionTimeout(val);
    await fetch('/api/admin/security/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionTimeout: val }),
    });
  }

  // QR code como imagen (usando la URL otpauth:// directamente con qrcode.react si disponible,
  // o fallback a un servicio de QR público)
  const qrImgUrl = qrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
    : '';

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* ── 2FA ──────────────────────────────────────────────────── */}
      <div className="admin-card">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
               style={{ background: twoFactorEnabled ? 'rgba(34,197,94,0.15)' : 'var(--admin-surface-2)' }}>
            {twoFactorEnabled
              ? <ShieldCheck size={20} style={{ color: '#22c55e' }} />
              : <Shield size={20} style={{ color: 'var(--admin-text-muted)' }} />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
              {t('security.twoFactor')}
            </h3>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {t('security.twoFactorDesc')}
            </p>

            {/* Estado habilitado */}
            {twoFactorEnabled && setupStep !== 'done' && (
              <div className="mt-4 flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: '#22c55e' }}>
                  <CheckCircle2 size={15} /> {t('security.twoFactorActive')}
                </span>
                <button onClick={disable2FA} disabled={saving}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition"
                  style={{ color: 'var(--admin-danger, #f87171)', border: '1px solid rgba(248,113,113,0.3)' }}>
                  <ShieldOff size={14} /> {t('security.disable2FA')}
                </button>
              </div>
            )}

            {/* Setup completado */}
            {setupStep === 'done' && (
              <div className="mt-4 flex items-center gap-2 rounded-lg p-3"
                   style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                <span className="text-sm" style={{ color: '#22c55e' }}>{t('security.twoFactorEnabled')}</span>
              </div>
            )}

            {/* Estado deshabilitado: botón para activar */}
            {!twoFactorEnabled && setupStep === 'idle' && (
              <button onClick={start2FASetup} disabled={saving} className="admin-btn mt-4">
                {saving ? t('common.loading') : t('security.enable2FA')}
              </button>
            )}

            {/* Paso 1: Escanear QR */}
            {setupStep === 'scan' && (
              <div className="mt-4 flex flex-col gap-4">
                <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('security.scanQR')}</p>
                {qrImgUrl && (
                  <div className="w-fit rounded-lg p-3" style={{ background: '#fff' }}>
                    <Image src={qrImgUrl} alt="QR 2FA" width={200} height={200} unoptimized />
                  </div>
                )}
                <div className="rounded-lg p-3" style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }}>
                  <p className="mb-1 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{t('security.manualCode')}</p>
                  <code className="text-sm font-mono" style={{ color: 'var(--admin-accent)' }}>{secret}</code>
                </div>
                <button onClick={() => setSetupStep('verify')} className="admin-btn w-fit">
                  {t('security.scannedNext')}
                </button>
              </div>
            )}

            {/* Paso 2: Verificar código */}
            {setupStep === 'verify' && (
              <div className="mt-4 flex flex-col gap-3 max-w-xs">
                <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>{t('security.enterCode')}</p>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  className="admin-input text-center text-2xl font-mono tracking-[0.5em]"
                  placeholder="000000"
                  onKeyDown={e => e.key === 'Enter' && verify2FA()}
                />
                {error && (
                  <p className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--admin-danger, #f87171)' }}>
                    <AlertTriangle size={14} /> {error}
                  </p>
                )}
                <button onClick={verify2FA} disabled={saving || code.length < 6} className="admin-btn">
                  {saving ? t('common.verifying') : t('security.verifyActivate')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeout de sesión ───────────────────────────────────── */}
      <div className="admin-card">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
               style={{ background: 'var(--admin-surface-2)' }}>
            <Clock size={20} style={{ color: 'var(--admin-text-muted)' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--admin-text)' }}>
              {t('security.sessionTimeout')}
            </h3>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
              {t('security.sessionTimeoutDesc')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TIMEOUT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => saveSessionTimeout(opt.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition`}
                  style={sessionTimeout === opt.value ? {
                    background: 'var(--admin-accent)',
                    color: '#fff',
                    border: '1px solid var(--admin-accent)',
                  } : {
                    color: 'var(--admin-text-muted)',
                    border: '1px solid var(--admin-border)',
                    background: 'transparent',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
              {sessionTimeout === 0
                ? t('security.neverExpires')
                : `${t('security.currentTimeout')}: ${TIMEOUT_OPTIONS.find(o => o.value === sessionTimeout)?.label ?? sessionTimeout + ' min'}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
