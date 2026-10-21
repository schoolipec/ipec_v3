import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { AdminLangProvider } from '@/components/admin/AdminLangContext';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — IPEC',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AdminLangProvider>
            {children}
          </AdminLangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
