// Carga inicial del contenido editable. Idempotente: solo crea lo que falta y NUNCA pisa lo que alguien editó
// desde el admin, por eso puede correr en cada arranque del contenedor (así entran las claves nuevas del código).
// No contiene datos personales (regla de Juan). Uso: node prisma/seed.mjs
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const LOCALES = ['en', 'es', 'pt', 'ko', 'de'];
const prisma = new PrismaClient();

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

// { hero: { title: "x" }, bibleModal: { verses: [{ text }] } } → [["hero","title","x"], ["bibleModal","verses.0.text", ...]]
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

const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const bootstrapName = process.env.ADMIN_BOOTSTRAP_NAME?.trim();
const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (bootstrapEmail && bootstrapName && bootstrapPassword) {
  const existing = await prisma.user.findUnique({where: {email: bootstrapEmail}});
  if (!existing) {
    await prisma.user.create({data: {
      email: bootstrapEmail,
      name: bootstrapName,
      passwordHash: await bcrypt.hash(bootstrapPassword, 12),
      role: 'SUPERADMIN',
    }});
    console.log('[seed] SuperAdmin inicial creado desde variables de entorno');
  }
}
await prisma.$disconnect();
