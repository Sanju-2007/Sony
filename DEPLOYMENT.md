# Production Deployment Guide

This guide covers deploying the **Social Listening & Realtime Presence Platform** to production across multiple target platforms.

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Client Web / Mobile    │
                          │   (Nginx / Expo Web)     │
                          │        Port 80/3000      │
                          └─────────────┬────────────┘
                                        │
                         HTTP REST      │  WebSocket
                         /api/v1/*      │  /realtime
                                        ▼
                          ┌──────────────────────────┐
                          │     NestJS API & SFU     │
                          │        Port 4000         │
                          └──────┬────────────┬──────┘
                                 │            │
             PostgreSQL 16 ◄─────┘            └─────► Redis 7
             (Prisma ORM)                            (Presence & Queues)
                                 │
                                 ├─────► LiveKit WebRTC SFU (Port 7880)
                                 │
                                 └─────► S3 / MinIO (Media & Voice Notes)
```

---

## Option 1: Docker Compose (All-in-One / Single VPS)

Deploy the entire production stack (Postgres, Redis, MinIO, LiveKit SFU, NestJS API, and Nginx Web Frontend) on a single Ubuntu / Debian VPS with Docker and Docker Compose.

### 1. Clone Repository & Prepare Environment
```bash
git clone https://github.com/your-org/sony-social-music.git
cd sony-social-music

# Copy production environment configuration
cp .env.production.example .env
```

### 2. Configure Secrets in `.env`
Generate cryptographically strong secrets for production:
```bash
# Generate JWT keys
openssl rand -base64 48
```
Update `.env` with:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1` (or `http://your-server-ip:4000/api/v1`)
- `EXPO_PUBLIC_WS_URL=https://api.yourdomain.com/realtime` (or `http://your-server-ip:4000/realtime`)

### 3. Build & Run Containers
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Run Database Migrations & Seed Initial Data
```bash
# Run migrations inside the running API container
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Seed initial rooms and tracks (optional)
docker compose -f docker-compose.prod.yml exec api npx ts-node apps/api/prisma/seed.ts
```

### 5. Verify Services
- **Web App**: `http://<your-server-ip>:3000`
- **API Healthcheck**: `http://<your-server-ip>:4000/api/v1/health`
- **Socket Gateway**: `http://<your-server-ip>:4000/realtime`
- **MinIO Console**: `http://<your-server-ip>:9001`

---

## Option 2: Cloud PaaS (Railway / Render / Fly.io)

### Backend API (`apps/api`)
1. **Repository Link**: Connect your GitHub repository to Railway or Render.
2. **Root Directory**: Set root directory to repository root (`/`).
3. **Build Command**:
   ```bash
   npm ci && npm run prisma:generate --workspace=@sony/api && npm run build
   ```
4. **Pre-deploy / Release Command**:
   ```bash
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   ```
5. **Start Command**:
   ```bash
   node apps/api/dist/main.js
   ```
6. **Required Environment Variables**:
   - `NODE_ENV=production`
   - `PORT=4000` (or leave default if provider sets `PORT`)
   - `DATABASE_URL=postgresql://...` (Attach Managed Postgres instance)
   - `REDIS_HOST=...` (Attach Managed Redis instance)
   - `REDIS_PORT=6379`
   - `JWT_ACCESS_SECRET=...`
   - `JWT_REFRESH_SECRET=...`
   - `CORS_ORIGIN=*`

---

### Web Frontend (`apps/mobile`) - Vercel / Netlify / Cloudflare Pages

1. **Build Static Export**:
   ```bash
   npm run mobile:build
   ```
2. **Publish Directory**: `apps/mobile/dist`
3. **Environment Variables**:
   - `EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
   - `EXPO_PUBLIC_WS_URL=https://api.yourdomain.com/realtime`
4. **SPA Rewrite Rules**:
   - For **Vercel** (`vercel.json`):
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - For **Netlify** (`_redirects` in public):
     ```
     /*    /index.html   200
     ```

---

## Option 3: Kubernetes / Helm / ECS

The monorepo contains dedicated Dockerfiles:
- **API Container**: `apps/api/Dockerfile` (Multi-stage Node.js 20 Alpine runner)
- **Web App Container**: `apps/mobile/Dockerfile` (Multi-stage Nginx Alpine runner with gzip and caching)

Build and push commands:
```bash
# Build API image
docker build -t your-registry/sony-api:latest -f apps/api/Dockerfile .

# Build Web image
docker build -t your-registry/sony-web:latest -f apps/mobile/Dockerfile .
```

---

## Health Check & Monitoring

The backend exposes an authoritative healthcheck endpoint for load balancers (ALB, Nginx, Traefik, K8s liveness/readiness probes):

```http
GET /api/v1/health
```

**Expected JSON Response (Healthy)**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-18T14:14:08.123Z",
  "uptimeSec": 3600,
  "services": {
    "database": "UP",
    "redis": "UP",
    "livekit": "CONFIGURED",
    "objectStorage": "CONFIGURED"
  }
}
```

---

## Production Security Best Practices

1. **CORS Configuration**: In production, restrict `CORS_ORIGIN` in `.env` to your verified domain:
   ```
   CORS_ORIGIN=https://app.yourdomain.com
   ```
2. **Reverse Proxy SSL**: Terminate TLS at Nginx, Cloudflare, or AWS ALB with HTTP/2 and WebSocket (`Upgrade: websocket`) forwarding enabled.
3. **Rate Limiting**: Protect authentication endpoints (`/api/v1/auth/*`) behind Cloudflare or Nginx rate limiting to safeguard OTP and login flows.
