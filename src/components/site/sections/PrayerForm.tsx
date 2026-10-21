'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BRAND_BUTTON } from './ui';

const MAX_CHARS = 500;
const NAME_MAX = 100;

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'tooMany';

export default function PrayerForm() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const remaining = MAX_CHARS - request.length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const website = new FormData(e.currentTarget).get('website');
    try {
      const res = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, request, locale, website }),
      });
      if (res.status === 429) return setStatus('tooMany');
      if (!res.ok) return setStatus('error');
      setName('');
      setRequest('');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-line bg-alt px-4 py-2.5 text-sm text-primary transition-colors focus:ring-2 focus:ring-[#7CB342] focus:outline-none';

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-xl border border-green/30 bg-green/10 p-6 text-center">
        <div className="mb-2 text-3xl" aria-hidden="true">
          🙏
        </div>
        <p className="font-semibold text-primary">{t('successTitle')}</p>
        <p className="mt-1 text-sm text-secondary">{t('successText')}</p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-4 text-sm text-green underline dark:text-lime">
          {t('close')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="prayer-name" className="mb-1 block text-sm font-medium text-secondary">
          {t('name')}
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="prayer-name"
          type="text"
          required
          maxLength={NAME_MAX}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="prayer-request" className="mb-1 block text-sm font-medium text-secondary">
          {t('request')}
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="prayer-request"
          required
          maxLength={MAX_CHARS}
          rows={5}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          aria-describedby="prayer-remaining"
          className={`${fieldClass} resize-none`}
        />
        <p
          id="prayer-remaining"
          aria-live="polite"
          className={`mt-1 text-right text-xs ${remaining <= 50 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-secondary'}`}
        >
          {t('remaining', { count: remaining })}
        </p>
      </div>

      {/* Campo trampa: invisible para personas, los robots lo llenan y el servidor los descarta */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {(status === 'error' || status === 'tooMany') && (
        <p role="alert" className="text-sm text-red-500">
          {status === 'tooMany' ? t('tooMany') : t('errorSending')}
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className={BRAND_BUTTON}>
        {status === 'sending' ? '…' : t('send')}
      </button>
    </form>
  );
}
