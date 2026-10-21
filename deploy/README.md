# Deploy en el VPS (v3.suplenitud.com)

## VPS objetivo

`vps-rescuvo` — 193.203.165.192  
Ya tiene Traefik + red `n8n-internal` + MailCow + n8n corriendo.

## Pasos (una sola conexión SSH)

### 1. Preparar el .env en el VPS

```bash
mkdir -p /opt/ipec-v3
cd /opt/ipec-v3
# Crear el .env con los valores reales (ver deploy/env.example como guía)
nano .env
```

Generar contraseñas seguras:
```bash
openssl rand -base64 32   # → POSTGRES_PASSWORD
openssl rand -hex 32      # → SESSION_SECRET
```

### 2. Clonar el repositorio

```bash
cd /opt/ipec-v3
git clone https://github.com/schoolipec/ipec_v3.git app
```

### 3. Copiar el .env al directorio de la app

```bash
cp /opt/ipec-v3/.env /opt/ipec-v3/app/.env
```

### 4. Construir y levantar

```bash
cd /opt/ipec-v3/app
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

El primer arranque tarda ~3 min (build de Next.js). Verificar con:
```bash
docker logs ipec-v3-app -f
```

### 5. Verificar

```bash
curl -s https://v3.suplenitud.com/api/health
# Esperado: {"ok":true,"database":true}
```

## DNS

Asegurarse de que `v3.suplenitud.com` apunte a `193.203.165.192`  
(el wildcard `A * -> 179.236.255.48` NO aplica aquí — el VPS Rescuvo tiene diferente IP)

En Cloudflare, agregar/verificar:
- Tipo: A  
- Nombre: v3  
- Contenido: 193.203.165.192  
- Proxy: desactivado (DNS only) para permitir TLS de Traefik

## Actualizar en el futuro

```bash
cd /opt/ipec-v3/app
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
