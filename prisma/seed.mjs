// Carga inicial del contenido editable. Idempotente: solo crea lo que falta y NUNCA pisa lo que alguien editó
// desde el admin, por eso puede correr en cada arranque del contenedor (así entran las claves nuevas del código).
// No contiene datos personales (regla de Juan). Uso: node prisma/seed.mjs
import { readFileSync } from 'node:fs';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const LOCALES = ['en', 'es', 'pt', 'ko', 'de'];
const prisma = new PrismaClient();

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

// { hero: { title: "x" }, bibleModal: { verses: [{ text }] } } → [["hero","title","x"], ...]
function flatten(messages) {
  const rows = [];
  for (const [section, content] of Object.entries(messages)) {
    const walk = (value, path) => {
      if (value !== null && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
      } else {
        rows.push([section, path, String(value)]);
      }
    };
    walk(content, '');
  }
  return rows;
}

const data = [];
for (const locale of LOCALES) {
  for (const [section, key, value] of flatten(readJson(`../messages/site/${locale}.json`))) {
    data.push({ section, key, locale, value });
  }
}
for (const [key, value] of Object.entries(readJson('../messages/site-defaults.json'))) {
  data.push({ section: 'site', key, locale: 'all', value });
}

const { count } = await prisma.contentEntry.createMany({ data, skipDuplicates: true });
const total = await prisma.contentEntry.count();
console.log(`[seed] contenido: ${data.length} definidos, ${count} nuevos, ${total} en la BD`);

// Versículos del día (RV1960, KJV, ARA, LUT, KRV). Solo agrega los que faltan.
const verses = readJson('./data/bible-verses.json');
const verseResult = await prisma.bibleVerse.createMany({ data: verses, skipDuplicates: true });
console.log(`[seed] versículos: ${verses.length} definidos, ${verseResult.count} nuevos`);

// SuperAdmin inicial: usa scrypt nativo de Node.js (sin dependencias externas).
// El hash queda con prefijo "scrypt:" para que auth.ts lo reconozca.
// La aplicación admite ambos formatos: "scrypt:" (seed) y "$2b$" (bcryptjs, a partir del primer login).
const saEmail = process.env.SUPERADMIN_EMAIL;
const saPassword = process.env.SUPERADMIN_PASSWORD;
const saName = process.env.SUPERADMIN_NAME ?? 'Super Admin';
if (saEmail && saPassword) {
  const exists = await prisma.user.findUnique({ where: { email: saEmail } });
  if (!exists) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(saPassword, salt, 64).toString('hex');
    const passwordHash = `scrypt:${salt}:${hash}`;
    await prisma.user.create({
      data: { email: saEmail, name: saName, passwordHash, role: 'SUPERADMIN', permissions: {} },
    });
    console.log(`[seed] superadmin creado: ${saEmail}`);
  } else {
    console.log(`[seed] superadmin ya existe: ${saEmail}`);
  }
}

void timingSafeEqual; // marca usada, evita warning del linter
await prisma.$disconnect();
