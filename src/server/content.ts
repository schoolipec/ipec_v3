import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './db';
import siteDefaults from '../../messages/site-defaults.json';

export const CONTENT_TAG = 'site-content';
export const SHARED_LOCALE = 'all';

type Messages = Record<string, unknown>;

// "verses.0.text" → { verses: [{ text }] }: los segmentos numéricos vuelven a ser listas
function setPath(target: Record<string, unknown>, path: string[], value: string) {
  let node: Record<string, unknown> = target;
  path.forEach((segment, i) => {
    if (i === path.length - 1) {
      node[segment] = value;
      return;
    }
    if (node[segment] === undefined) node[segment] = /^\d+$/.test(path[i + 1]) ? [] : {};
    node = node[segment] as Record<string, unknown>;
  });
}

async function loadFromDb(locale: string): Promise<Messages> {
  const rows = await prisma.contentEntry.findMany({
    where: { locale: { in: [locale, SHARED_LOCALE] } },
    select: { section: true, key: true, value: true },
  });
  const messages: Record<string, unknown> = {};
  for (const row of rows) {
    if (!messages[row.section]) messages[row.section] = {};
    setPath(messages[row.section] as Record<string, unknown>, row.key.split('.'), row.value);
  }
  return messages;
}

// Caché compartida entre visitas; el admin la invalida al guardar (revalidateTag(CONTENT_TAG, { expire: 0 }))
const cachedContent = unstable_cache(loadFromDb, ['site-content'], { tags: [CONTENT_TAG] });

async function fileFallback(locale: string): Promise<Messages> {
  const file = (await import(`../../messages/site/${locale}.json`)).default as Messages;
  return { ...file, site: siteDefaults };
}

// Textos del sitio para un idioma. Si la BD no responde, el sitio sigue funcionando con los archivos de la carga inicial.
export async function getSiteMessages(locale: string): Promise<Messages> {
  try {
    const messages = await cachedContent(locale);
    if (Object.keys(messages).length > 0) return messages;
    console.warn('[content] la BD no tiene contenido; usando archivos. ¿Falta correr prisma/seed.mjs?');
  } catch (err) {
    console.error('[content] no se pudo leer la BD; usando archivos', err);
  }
  return fileFallback(locale);
}
