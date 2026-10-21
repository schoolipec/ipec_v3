# Imagen de desarrollo. La de producción (multi-stage, standalone) se agrega en la fase 6.
FROM node:24-alpine

# Prisma necesita OpenSSL y Alpine no lo trae (falla real en v2)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000
# Si el volumen anónimo de node_modules está vacío (primer arranque o --renew-anon-volumes), reinstala
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node prisma/seed.mjs && npm run dev"]
