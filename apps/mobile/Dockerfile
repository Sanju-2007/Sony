# Multi-stage production Dockerfile for @sony/mobile Web
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY packages/audio-ducking/package*.json ./packages/audio-ducking/
COPY packages/music-core/package*.json ./packages/music-core/
COPY apps/api/package*.json ./apps/api/
COPY apps/mobile/package*.json ./apps/mobile/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/mobile/ ./apps/mobile/

# Build shared packages
RUN npm run build

# Export Expo Web static distribution bundle
WORKDIR /app/apps/mobile
RUN npx expo export -p web

# Lightweight Nginx runtime stage
FROM nginx:alpine AS runner

COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/mobile/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
