# Multi-stage production Dockerfile for @sony/api
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY packages/audio-ducking/package*.json ./packages/audio-ducking/
COPY packages/music-core/package*.json ./packages/music-core/
COPY apps/api/package*.json ./apps/api/
COPY apps/mobile/package*.json ./apps/mobile/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source files
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Generate Prisma Client & Build all packages and API
RUN npm run prisma:generate --workspace=@sony/api
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY packages/audio-ducking/package*.json ./packages/audio-ducking/
COPY packages/music-core/package*.json ./packages/music-core/
COPY apps/api/package*.json ./apps/api/
COPY apps/mobile/package*.json ./apps/mobile/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled outputs from builder
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/audio-ducking/dist ./packages/audio-ducking/dist
COPY --from=builder /app/packages/music-core/dist ./packages/music-core/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY apps/api/prisma ./apps/api/prisma

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
