import createMiddleware from 'next-intl/middleware';
import { after, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { isPageView, recordVisit } from './server/analytics';

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const res = intl(req);
  if (res.status === 200 && isPageView(req)) {
    after(() => recordVisit(req).catch((err) => console.warn('[analytics] no se pudo registrar la visita', err)));
  }
  return res;
}

export const config = {
  // El admin tiene su propio sistema de idioma (en/es); por eso queda fuera, igual que api y archivos estáticos
  matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)',
};
