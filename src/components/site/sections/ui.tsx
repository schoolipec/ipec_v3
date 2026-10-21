// Piezas visuales repetidas en las secciones (mismo estilo que v2)
export const BRAND_BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-full px-10 py-3.5 font-bold text-white shadow-lg transition-all duration-200 bg-brand-gradient hover:scale-105 hover:opacity-90 disabled:scale-100 disabled:opacity-60';

export const INSTAGRAM_BUTTON =
  'inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all duration-200 bg-instagram-gradient hover:scale-105 hover:opacity-90';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-semibold tracking-widest text-green uppercase dark:text-lime">{children}</p>;
}

export function InstagramIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" />
    </svg>
  );
}
