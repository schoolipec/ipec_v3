import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // El admin tiene su propio sistema de idioma (en/es); por eso queda fuera, igual que api y archivos estáticos
  matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)',
};
