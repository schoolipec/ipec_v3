import 'server-only';
import sanitizeHtml from 'sanitize-html';

// Solo las etiquetas y estilos que produce el editor; todo lo demás se elimina
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'span'],
  allowedAttributes: {
    p: ['style'],
    span: ['style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|center|right|justify)$/],
      display: [/^block$/],
      'font-size': [/^\d{1,3}px$/],
      color: [/^#[0-9a-fA-F]{6}$/],
      'font-family': [/^[\w\s",'-]{1,120}$/],
    },
  },
  disallowedTagsMode: 'discard',
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}

// Para mostrar dentro de títulos y párrafos del sitio: los párrafos pasan a bloques en línea
export function renderRichText(html: string): string {
  return sanitizeHtml(html, {
    ...OPTIONS,
    transformTags: {
      p: (_tag, attribs) => ({ tagName: 'span', attribs: { style: `display:block;${attribs.style ?? ''}` } }),
    },
  });
}
