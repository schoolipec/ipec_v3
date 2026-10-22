'use client';
import { useEffect, useState } from 'react';

// Usa el contenedor marcado con data-scroll-root (panel admin) o la ventana (sitio público)
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-scroll-root]');
    const target: HTMLElement | Window = root ?? window;
    const read = () => (root ? root.scrollTop : window.scrollY);
    const onScroll = () => setVisible(read() > 400);
    onScroll();
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  function toTop() {
    const root = document.querySelector<HTMLElement>('[data-scroll-root]');
    if (root) root.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Subir al inicio"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-500"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
