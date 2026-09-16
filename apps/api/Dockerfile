# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configs
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

# Install and build packages
RUN npm ci
RUN npm run build --workspace=@sony/types
RUN npm run build --workspace=@sony/music-core
RUN npm run build --workspace=@sony/audio-ducking
RUN npm run prisma:generate --workspace=@sony/api
RUN npm run build --workspace=@sony/api

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/package*.json apps/api/
COPY apps/api/prisma apps/api/prisma

RUN npm ci --omit=dev
RUN npm run prisma:generate --workspace=@sony/api

COPY --from=builder /app/packages/types/dist packages/types/dist
COPY --from=builder /app/packages/music-core/dist packages/music-core/dist
COPY --from=builder /app/packages/audio-ducking/dist packages/audio-ducking/dist
COPY --from=builder /app/apps/api/dist apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
