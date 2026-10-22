// Campos que aceptan texto enriquecido (negritas, tamaño, color, tipografía, alineación). Compartido por panel y sitio.
export const RICH_KEYS = new Set([
  'hero.tagline',
  'hero.title',
  'hero.description',
  'about.label',
  'about.title',
  'about.text',
]);

export const FONT_FAMILIES: Record<string, string> = {
  sans: 'Arial, Helvetica, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  humanist: '"Trebuchet MS", Verdana, sans-serif',
  mono: '"Courier New", Courier, monospace',
};
