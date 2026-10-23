import { getTranslations } from 'next-intl/server';
import siteDefaults from '../../../messages/site-defaults.json';

export type SiteInfo = typeof siteDefaults;

const URL_KEYS: (keyof SiteInfo)[] = ['youtube', 'facebook', 'square'];

function ensureHttps(val: string): string {
  if (!val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/')) return val;
  return `https://${val}`;
}

// Datos de la iglesia, enlaces e imágenes: vienen de la BD (sección "site", iguales en todos los idiomas).
// Se leen "en crudo" (t.raw) para que URLs y teléfonos no pasen por el formato de mensajes.
export async function getSiteInfo(): Promise<SiteInfo> {
  const t = await getTranslations('site');
  const keys = Object.keys(siteDefaults) as (keyof SiteInfo)[];
  return Object.fromEntries(keys.map((k) => {
    const raw = (t.raw(k) as string | undefined) ?? siteDefaults[k];
    return [k, URL_KEYS.includes(k) ? ensureHttps(raw as string) : raw];
  })) as SiteInfo;
}
