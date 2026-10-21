import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — IPEC',
  robots: { index: false, follow: false },
};

// Carcasa raíz propia del admin (separada del sitio). Idioma en/es y tema se agregan en la fase 5.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
