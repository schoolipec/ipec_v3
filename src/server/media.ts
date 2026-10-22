import 'server-only';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function sniffImageMime(bytes: Uint8Array): string | null {
  const hex = (n: number) => bytes[n]?.toString(16).padStart(2, '0');
  if (hex(0) === '89' && hex(1) === '50' && hex(2) === '4e' && hex(3) === '47') return 'image/png';
  if (hex(0) === 'ff' && hex(1) === 'd8' && hex(2) === 'ff') return 'image/jpeg';
  const ascii = (from: number, len: number) => String.fromCharCode(...bytes.slice(from, from + len));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp';
  return null;
}
