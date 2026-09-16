# Social Listening & Realtime Presence Platform

> *"Let's listen together even when we're far apart."*

A production-grade, cross-platform social music listening and realtime presence platform. Built with a minimalist monochrome aesthetic, fluid typography, sparse dynamic background particles, and synchronized multi-device playback.

---

## 🏛️ Core Architecture Principles

1. **Zero Copyrighted Audio Relay**:
   - The backend and WebRTC channels **never** download, proxy, stream, or cache copyrighted commercial audio.
   - All playback is driven directly on the user's client device via authorized provider SDKs (Apple Music MusicKit, Spotify Web Playback / App Remote, or Licensed Catalogs).
2. **Authoritative Playback Synchronization (`PlaybackSyncEngine`)**:
   - Event-driven state vectors with client-side clock extrapolation.
   - Micro-drift (< 150ms): Ignored for seamless playback.
   - Moderate drift (150ms – 800ms): Playback rate is smoothly nudged (0.95x / 1.05x) to eliminate audible pops/clicks.
   - Macro drift (> 800ms): Hard seek to authoritative target position.
3. **Audio Ducking State Machine ("Sing Together")**:
   - Realtime voice chat operates via LiveKit WebRTC SFU.
   - When voice activity is detected (locally or remotely), music volume automatically attenuates to **40% over 150ms** (exponential ease-out).
   - An **800ms hold time** prevents volume pumping during natural speech pauses.
   - Volume fades smoothly back to **100% over 500ms** when speech ends.
4. **Minimalist Aesthetic & Dynamic Particles**:
   - High whitespace, crisp typography, and 24 sparse floating particles running declaratively on native threads via React Native Reanimated.
   - Particles react subtly to music cadence and voice activity.

---

## 📦 Monorepo Structure

```
├── apps/
│   ├── api/                   # NestJS Modular Monolith Backend
│   │   ├── prisma/            # Normalized PostgreSQL Schema (Prisma ORM)
│   │   ├── src/
│   │   │   ├── modules/auth/  # JWT & Password Hashing (Register, Login, Refresh)
│   │   │   ├── modules/users/ # Profiles, Privacy, Friends
│   │   │   ├── modules/rooms/ # Public & Private Room Lifecycle, Host Election
│   │   │   ├── modules/sync/  # Authoritative Playback State Vector Service
│   │   │   └── modules/gateway/ # Socket.IO Realtime Gateway (Presence, Chat, Reactions)
│   │   └── test/              # Unit & Integration Tests (Jest)
│   │
│   └── mobile/                # React Native + Expo Mobile Application
│       ├── app/
│       │   ├── (tabs)/        # Home, Discover, Friends, Messages, Profile
│       │   └── room/[id].tsx  # Fullscreen Immersive Room View
│       └── src/
│           ├── components/    # BackgroundParticles, ScrubBar, SingTogetherIndicator, Reactions
│           ├── store/         # Zustand Stores (authStore, playbackStore, roomStore)
│           └── theme/         # Design Tokens (Monochrome palette, Typography, Radii)
│
├── packages/
│   ├── types/                 # Shared Protocol Contracts & DTOs
│   ├── music-core/            # MusicProvider Abstraction & DriftCalculator
│   └── audio-ducking/         # Audio Ducking State Machine
│
├── infra/
│   └── docker-compose.yml     # PostgreSQL 16, Redis 7, MinIO (S3), LiveKit SFU
└── .github/workflows/ci.yml   # GitHub Actions CI Workflow
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 20.0.0
- Docker & Docker Compose (optional for database services)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Infrastructure
```bash
npm run infra:up
```
*Spins up PostgreSQL on `5432`, Redis on `6379`, MinIO on `9000/9001`, and LiveKit on `7880`.*

### 4. Build Shared Packages & Run Backend
```bash
# Build shared packages
npm run build --workspace=@sony/types
npm run build --workspace=@sony/music-core
npm run build --workspace=@sony/audio-ducking

# Start NestJS API in watch mode
npm run api:dev
```
API runs on `http://localhost:4000/api/v1` with Socket.IO on `/realtime`.

### 5. Start Mobile App
```bash
npm run mobile:start
```
Runs Metro bundler for iOS, Android, and Web (`w` to open web preview).

### 6. Run Test Suite & Typecheck
```bash
npm run typecheck
npm test
```
