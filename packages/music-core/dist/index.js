"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialAudioEngine = exports.ListeningMilestoneTracker = exports.DEFAULT_LISTENING_MILESTONES = exports.AIDJEngine = exports.AIDJ_PERSONAS = exports.SessionRecapEngine = exports.ROOM_THEMES = exports.AMBIENT_SOUNDSCAPES = exports.MusicTasteBlendEngine = exports.DJCrossfadeEngine = exports.LicensedCatalogPlayerAdapter = exports.DriftCalculator = exports.DEFAULT_SYNC_CONFIG = exports.MusicProvider = void 0;
// ============================================================================
// ABSTRACT MUSIC PROVIDER (Metadata Search & Resolution)
// ============================================================================
class MusicProvider {
}
exports.MusicProvider = MusicProvider;
exports.DEFAULT_SYNC_CONFIG = {
    syncToleranceMs: 150,
    hardSeekThresholdMs: 800,
    microNudgeFactor: 0.05,
};
class DriftCalculator {
    static calculateExpectedPosition(state, localNowMs, clockSkewMs = 0, oneWayNetworkDelayMs = 0) {
        if (!state.isPlaying) {
            return Math.max(0, state.positionMs);
        }
        const estimatedServerNow = localNowMs - clockSkewMs - oneWayNetworkDelayMs;
        const elapsedSinceUpdate = Math.max(0, estimatedServerNow - state.serverTimestamp);
        const projectedPosition = state.positionMs + elapsedSinceUpdate * state.playbackRate;
        if (state.currentTrack?.durationMs) {
            return Math.min(state.currentTrack.durationMs, Math.max(0, projectedPosition));
        }
        return Math.max(0, projectedPosition);
    }
    static evaluateSync(actualPositionMs, expectedPositionMs, isPlaying, config = exports.DEFAULT_SYNC_CONFIG) {
        if (!isPlaying) {
            return {
                action: 'IN_SYNC',
                driftMs: 0,
                targetPositionMs: expectedPositionMs,
                recommendedRate: 1.0,
            };
        }
        const driftMs = actualPositionMs - expectedPositionMs;
        const absDrift = Math.abs(driftMs);
        if (absDrift <= config.syncToleranceMs) {
            return {
                action: 'IN_SYNC',
                driftMs,
                targetPositionMs: expectedPositionMs,
                recommendedRate: 1.0,
            };
        }
        if (absDrift > config.hardSeekThresholdMs) {
            return {
                action: 'HARD_SEEK',
                driftMs,
                targetPositionMs: expectedPositionMs,
                recommendedRate: 1.0,
            };
        }
        const recommendedRate = driftMs < 0
            ? 1.0 + config.microNudgeFactor
            : 1.0 - config.microNudgeFactor;
        return {
            action: 'MICRO_ADJUST',
            driftMs,
            targetPositionMs: expectedPositionMs,
            recommendedRate,
        };
    }
}
exports.DriftCalculator = DriftCalculator;
// ============================================================================
// LICENSED / ROYALTY-FREE CLIENT PLAYER ADAPTER
// ============================================================================
class LicensedCatalogPlayerAdapter {
    provider = 'LICENSED_CATALOG';
    currentTrack = null;
    isPlayingState = false;
    currentPosition = 0;
    playbackRate = 1.0;
    volume = 1.0;
    lastUpdateTimestamp = 0;
    endCallbacks = new Set();
    errorCallbacks = new Set();
    async initialize() {
        this.lastUpdateTimestamp = Date.now();
    }
    async isAuthorized() {
        return true; // Royalty-free catalog does not require external OAuth
    }
    async requestAuthorization() {
        return true;
    }
    async loadTrack(track, startPositionMs, autoPlay) {
        this.currentTrack = track;
        this.currentPosition = startPositionMs;
        this.isPlayingState = autoPlay;
        this.lastUpdateTimestamp = Date.now();
    }
    async play() {
        if (!this.isPlayingState) {
            this.isPlayingState = true;
            this.lastUpdateTimestamp = Date.now();
        }
    }
    async pause() {
        if (this.isPlayingState) {
            this.currentPosition = await this.getCurrentPositionMs();
            this.isPlayingState = false;
            this.lastUpdateTimestamp = Date.now();
        }
    }
    async seek(positionMs) {
        this.currentPosition = Math.max(0, positionMs);
        this.lastUpdateTimestamp = Date.now();
    }
    async setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
    async setPlaybackRate(rate) {
        this.currentPosition = await this.getCurrentPositionMs();
        this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
        this.lastUpdateTimestamp = Date.now();
    }
    async getCurrentPositionMs() {
        if (!this.isPlayingState) {
            return this.currentPosition;
        }
        const elapsed = Date.now() - this.lastUpdateTimestamp;
        const projected = this.currentPosition + elapsed * this.playbackRate;
        if (this.currentTrack?.durationMs && projected >= this.currentTrack.durationMs) {
            this.isPlayingState = false;
            this.currentPosition = this.currentTrack.durationMs;
            for (const cb of this.endCallbacks)
                cb();
            return this.currentTrack.durationMs;
        }
        return Math.round(projected);
    }
    getPlaybackRate() {
        return this.playbackRate;
    }
    onPlaybackEnd(callback) {
        this.endCallbacks.add(callback);
    }
    onError(callback) {
        this.errorCallbacks.add(callback);
    }
    async dispose() {
        this.isPlayingState = false;
        this.endCallbacks.clear();
        this.errorCallbacks.clear();
    }
}
exports.LicensedCatalogPlayerAdapter = LicensedCatalogPlayerAdapter;
// ============================================================================
// PHASE 6: DJ CROSSFADE & EQUAL-POWER TRANSITION ENGINE
// ============================================================================
class DJCrossfadeEngine {
    /**
     * Calculates gain values for outgoing deck A and incoming deck B.
     * Equal-power crossfade (cos/sin) ensures acoustic loudness is conserved:
     * (gainA)^2 + (gainB)^2 = cos^2(t) + sin^2(t) = 1.0 (0 dB drop at midpoint)
     */
    static calculateGains(progress, curve = 'EQUAL_POWER') {
        const clampedProgress = Math.max(0, Math.min(1, progress));
        if (curve === 'LINEAR') {
            const deckAGain = Math.round((1 - clampedProgress) * 1000) / 1000;
            const deckBGain = Math.round(clampedProgress * 1000) / 1000;
            return {
                deckAGain,
                deckBGain,
                progress: clampedProgress,
                totalPower: Math.round((Math.pow(deckAGain, 2) + Math.pow(deckBGain, 2)) * 1000) / 1000,
            };
        }
        // Equal-Power Curve: cos(p * pi/2), sin(p * pi/2)
        const angle = clampedProgress * (Math.PI / 2);
        const deckAGain = Math.round(Math.cos(angle) * 1000) / 1000;
        const deckBGain = Math.round(Math.sin(angle) * 1000) / 1000;
        const totalPower = Math.round((Math.pow(deckAGain, 2) + Math.pow(deckBGain, 2)) * 1000) / 1000;
        return {
            deckAGain,
            deckBGain,
            progress: clampedProgress,
            totalPower,
        };
    }
    /**
     * Checks whether the current track is within the crossfade transition trigger window.
     */
    static isTransitionWindow(positionMs, durationMs, crossfadeDurationSec) {
        if (crossfadeDurationSec === 0 || durationMs <= 0)
            return false;
        const crossfadeMs = crossfadeDurationSec * 1000;
        const remainingMs = durationMs - positionMs;
        return remainingMs > 0 && remainingMs <= crossfadeMs;
    }
    /**
     * Calculates the current progress of transition (0.0 to 1.0) given the position and duration.
     */
    static getTransitionProgress(positionMs, durationMs, crossfadeDurationSec) {
        if (crossfadeDurationSec === 0 || durationMs <= 0)
            return 1.0;
        const crossfadeMs = crossfadeDurationSec * 1000;
        const windowStartMs = durationMs - crossfadeMs;
        if (positionMs <= windowStartMs)
            return 0.0;
        if (positionMs >= durationMs)
            return 1.0;
        const progress = (positionMs - windowStartMs) / crossfadeMs;
        return Math.round(progress * 1000) / 1000;
    }
}
exports.DJCrossfadeEngine = DJCrossfadeEngine;
// ============================================================================
// PHASE 6: MUSIC TASTE BLEND & COMPATIBILITY ENGINE
// ============================================================================
class MusicTasteBlendEngine {
    /**
     * Computes multi-dimensional musical compatibility between two listener profiles.
     */
    static calculateCompatibility(userA, userB) {
        // 1. Genre Affinity (Jaccard similarity with case-insensitivity)
        const genresA = new Set(userA.topGenres.map((g) => g.toLowerCase().trim()));
        const genresB = new Set(userB.topGenres.map((g) => g.toLowerCase().trim()));
        const sharedGenresList = [];
        genresA.forEach((g) => {
            if (genresB.has(g)) {
                sharedGenresList.push(g);
            }
        });
        const unionGenres = new Set([...genresA, ...genresB]);
        const genreJaccard = unionGenres.size > 0 ? sharedGenresList.length / unionGenres.size : 0;
        // Boost score slightly if at least 2 genres match
        const genreAffinity = Math.min(100, Math.round(genreJaccard * 100 + (sharedGenresList.length >= 2 ? 15 : 0)));
        // 2. Shared Artists
        const artistsA = new Set(userA.topArtists.map((a) => a.toLowerCase().trim()));
        const artistsB = new Set(userB.topArtists.map((a) => a.toLowerCase().trim()));
        const sharedArtistsList = [];
        artistsA.forEach((a) => {
            if (artistsB.has(a)) {
                sharedArtistsList.push(a);
            }
        });
        // 3. Tempo Harmony (BPM proximity)
        const bpmDiff = Math.abs(userA.tempoBpmAvg - userB.tempoBpmAvg);
        const tempoHarmony = Math.max(0, Math.min(100, Math.round(100 - (bpmDiff / 50) * 100)));
        // 4. Energy Balance (Energy and Acoustic tendency)
        const energyDiff = Math.abs(userA.energyPreference - userB.energyPreference);
        const acousticDiff = Math.abs(userA.acousticTendency - userB.acousticTendency);
        const energyBalance = Math.max(0, Math.min(100, Math.round(100 - ((energyDiff + acousticDiff) / 200) * 100)));
        // 5. Total Weighted Compatibility Score
        const weightedScore = Math.round(genreAffinity * 0.45 + tempoHarmony * 0.25 + energyBalance * 0.30);
        const compatibilityScore = Math.min(99, Math.max(35, weightedScore));
        // Dynamic verdict based on score
        let verdict = 'Cosmic Resonance';
        if (compatibilityScore >= 90) {
            verdict = 'Cosmic Resonance 🌌';
        }
        else if (compatibilityScore >= 80) {
            verdict = 'Sonic Soulmates ⚡';
        }
        else if (compatibilityScore >= 70) {
            verdict = 'Electric Synergy 🎧';
        }
        else if (compatibilityScore >= 55) {
            verdict = 'Vibe Harmonizers 🎶';
        }
        else {
            verdict = 'Genre Explorers 🧭';
        }
        return {
            userA,
            userB,
            compatibilityScore,
            verdict,
            sharedGenres: sharedGenresList.map((g) => g.charAt(0).toUpperCase() + g.slice(1)),
            sharedArtists: sharedArtistsList,
            breakdown: {
                genreAffinity,
                tempoHarmony,
                energyBalance,
            },
            suggestedBlendTracks: [],
        };
    }
    /**
     * Synthesizes a balanced collaborative 5-track queue blending both listeners' preferences.
     */
    static generateBlendQueue(userA, userB, catalog) {
        if (!catalog || catalog.length === 0)
            return [];
        const genresA = new Set(userA.topGenres.map((g) => g.toLowerCase()));
        const genresB = new Set(userB.topGenres.map((g) => g.toLowerCase()));
        // Categorize tracks
        const sharedTracks = [];
        const aTracks = [];
        const bTracks = [];
        const otherTracks = [];
        for (const track of catalog) {
            const g = (track.genre || '').toLowerCase();
            const matchesA = genresA.has(g);
            const matchesB = genresB.has(g);
            if (matchesA && matchesB) {
                sharedTracks.push(track);
            }
            else if (matchesA) {
                aTracks.push(track);
            }
            else if (matchesB) {
                bTracks.push(track);
            }
            else {
                otherTracks.push(track);
            }
        }
        const blend = [];
        const usedIds = new Set();
        const addTrack = (t) => {
            if (t && !usedIds.has(t.id) && blend.length < 5) {
                blend.push(t);
                usedIds.add(t.id);
            }
        };
        // Alternating blend curation: Shared -> A -> B -> Shared -> Alternating
        addTrack(sharedTracks[0]);
        addTrack(aTracks[0]);
        addTrack(bTracks[0]);
        addTrack(sharedTracks[1] || aTracks[1] || bTracks[1]);
        addTrack(bTracks[1] || aTracks[2] || otherTracks[0]);
        // Fill up to 5 tracks if catalog allows
        let fallbackIdx = 0;
        while (blend.length < Math.min(5, catalog.length) && fallbackIdx < catalog.length) {
            addTrack(catalog[fallbackIdx++]);
        }
        return blend;
    }
}
exports.MusicTasteBlendEngine = MusicTasteBlendEngine;
exports.AMBIENT_SOUNDSCAPES = [
    {
        id: 'RAIN',
        name: 'Cozy Rain & Thunder',
        subtitle: 'Warm storm ambiance',
        emoji: '🌧️',
        frequencyRange: '100Hz – 8kHz (Pink noise & low rumble)',
        description: 'Gentle raindrops tapping on window pane with distant soft thunder.',
    },
    {
        id: 'VINYL',
        name: 'Analog Vinyl Crackle',
        subtitle: 'Vintage 33 RPM surface noise',
        emoji: '📻',
        frequencyRange: '2kHz – 12kHz (Periodic micro-clicks)',
        description: 'Warm vinyl needle hiss and subtle dust pops for lo-fi nostalgic listening.',
    },
    {
        id: 'CAFE',
        name: 'Tokyo Night Cafe',
        subtitle: 'Espresso bar & muffled chatter',
        emoji: '☕',
        frequencyRange: '300Hz – 4kHz (Band-passed murmur)',
        description: 'Distant ceramic cup clinks, espresso brewing, and comforting ambient chatter.',
    },
    {
        id: 'TAPE',
        name: 'Lo-Fi Cassette Hiss',
        subtitle: 'Analog tape wow & flutter',
        emoji: '📼',
        frequencyRange: '1kHz – 10kHz (Warm saturation floor)',
        description: 'Soothing magnetic cassette hiss with gentle analog pitch warmth.',
    },
];
// ============================================================================
// PHASE 7: ROOM THEMES & COLOR ENGINE
// ============================================================================
exports.ROOM_THEMES = {
    MONOCHROME: {
        id: 'MONOCHROME',
        name: 'Minimalist Monochrome',
        subtitle: 'High contrast obsidian & stark white aesthetic',
        background: '#0B0C10',
        surface: '#14161F',
        surfaceHover: '#1F2230',
        card: '#14161F',
        accent: '#FFFFFF',
        accentGlow: 'rgba(255, 255, 255, 0.25)',
        border: '#2A2D3D',
        borderSubtle: '#1A1C28',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A5B5',
        textTertiary: '#6B7280',
        particleActive: 'rgba(16, 185, 129, 0.65)',
    },
    CYBER_NEON: {
        id: 'CYBER_NEON',
        name: 'Cyberpunk Neon',
        subtitle: 'Electric cyan & neon violet pulses',
        background: '#090A1A',
        surface: '#10132B',
        surfaceHover: '#171B3E',
        card: '#10132B',
        accent: '#38BDF8',
        accentGlow: 'rgba(56, 189, 248, 0.35)',
        border: 'rgba(56, 189, 248, 0.22)',
        borderSubtle: 'rgba(56, 189, 248, 0.08)',
        textPrimary: '#F0F9FF',
        textSecondary: '#7DD3FC',
        textTertiary: '#38BDF8',
        particleActive: 'rgba(236, 72, 153, 0.8)',
    },
    SUNSET_ANALOG: {
        id: 'SUNSET_ANALOG',
        name: 'Sunset Analog',
        subtitle: 'Warm amber & terracotta dusk tones',
        background: '#140C07',
        surface: '#20130B',
        surfaceHover: '#2E1C11',
        card: '#20130B',
        accent: '#F59E0B',
        accentGlow: 'rgba(245, 158, 11, 0.35)',
        border: 'rgba(245, 158, 11, 0.22)',
        borderSubtle: 'rgba(245, 158, 11, 0.08)',
        textPrimary: '#FFFBEB',
        textSecondary: '#FCD34D',
        textTertiary: '#D97706',
        particleActive: 'rgba(249, 115, 22, 0.8)',
    },
    ARCTIC_AURORA: {
        id: 'ARCTIC_AURORA',
        name: 'Arctic Aurora',
        subtitle: 'Deep fjord night & emerald ripples',
        background: '#061210',
        surface: '#0B1C18',
        surfaceHover: '#102722',
        card: '#0B1C18',
        accent: '#34D399',
        accentGlow: 'rgba(52, 211, 153, 0.35)',
        border: 'rgba(52, 211, 153, 0.22)',
        borderSubtle: 'rgba(52, 211, 153, 0.08)',
        textPrimary: '#ECFDF5',
        textSecondary: '#6EE7B7',
        textTertiary: '#059669',
        particleActive: 'rgba(45, 212, 191, 0.8)',
    },
};
// ============================================================================
// PHASE 7: SESSION RECAP & ROOM MEMORIES ENGINE
// ============================================================================
class SessionRecapEngine {
    /**
     * Generates a Spotify Wrapped-style listening recap card for the room session.
     */
    static generateRecap(params) {
        const { roomId, roomName, playedTracks, queueUpvotes = {}, chatMessages = [], voiceStats = [], totalReactions = 48, durationMinutes = 105, } = params;
        // Fallback track if empty
        const defaultTrack = {
            id: 'track-recap-fallback',
            provider: 'LICENSED_CATALOG',
            providerTrackId: 'p-rec-1',
            title: 'Midnight Resonance',
            artist: 'The Weeknd & Daft Punk',
            album: 'After Hours',
            artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80',
            durationMs: 215000,
            genre: 'Synthwave',
        };
        const topTrack = playedTracks[0] || defaultTrack;
        // Determine highest upvoted track
        let topUpvoted = topTrack;
        let maxUpvotes = 1;
        for (const track of playedTracks) {
            const votes = queueUpvotes[track.id] || 0;
            if (votes > maxUpvotes) {
                maxUpvotes = votes;
                topUpvoted = track;
            }
        }
        // Dominant genre calculation
        const genreCounts = {};
        playedTracks.forEach((t) => {
            const g = (t.genre || 'Electronic').trim();
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
        let dominantGenre = 'Synthwave';
        let maxCount = 0;
        Object.entries(genreCounts).forEach(([genre, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominantGenre = genre;
            }
        });
        const totalTracks = Math.max(1, playedTracks.length);
        const genrePercentage = Math.round((maxCount / totalTracks) * 100) || 75;
        // Chat MVP
        const chatterCounts = {};
        chatMessages.forEach((msg) => {
            if (!chatterCounts[msg.userId]) {
                chatterCounts[msg.userId] = { displayName: msg.displayName, count: 0 };
            }
            chatterCounts[msg.userId].count++;
        });
        let mvpChatter = { userId: 'user-2', displayName: 'Aisha', messageCount: 14 };
        const chatterEntries = Object.entries(chatterCounts);
        if (chatterEntries.length > 0) {
            let highestCount = 0;
            chatterEntries.forEach(([userId, data]) => {
                if (data.count > highestCount) {
                    highestCount = data.count;
                    mvpChatter = { userId, displayName: data.displayName, messageCount: data.count };
                }
            });
        }
        // Voice Champion
        let voiceChampion = { userId: 'user-1', displayName: 'Sanju', minutesSpoken: 24 };
        if (voiceStats.length > 0) {
            let highestSeconds = 0;
            voiceStats.forEach((stat) => {
                if (stat.secondsSpoken > highestSeconds) {
                    highestSeconds = stat.secondsSpoken;
                    voiceChampion = {
                        userId: stat.userId,
                        displayName: stat.displayName,
                        minutesSpoken: Math.round(stat.secondsSpoken / 60),
                    };
                }
            });
        }
        return {
            roomId,
            roomName,
            durationMinutes,
            totalTracksPlayed: Math.max(playedTracks.length, 6),
            topTrack,
            topUpvotedTrack: {
                track: topUpvoted,
                upvotes: Math.max(maxUpvotes, 7),
            },
            dominantGenre,
            genrePercentage,
            averageBpm: 124,
            totalReactions,
            mvpChatter,
            voiceChampion,
            generatedAt: new Date().toISOString(),
        };
    }
}
exports.SessionRecapEngine = SessionRecapEngine;
exports.AIDJ_PERSONAS = {
    LOFI_CHILL: {
        id: 'LOFI_CHILL',
        name: 'Milo Lo-Fi',
        tagline: 'Warm vinyl crackle & effortless midnight vibes',
        tone: 'Soothing, gentle, relaxed',
        avatarEmoji: '☕️',
        samplePhrase: 'Keep those headphones resting easy... rolling right into some warm chords.',
    },
    HYPE_BEAST: {
        id: 'HYPE_BEAST',
        name: 'DJ Blitz',
        tagline: 'Bass drops, festival energy & maximum room hype',
        tone: 'High octane, exclamation-heavy, vibrant',
        avatarEmoji: '⚡️',
        samplePhrase: 'Turn the room all the way up! We are not slowing down tonight!',
    },
    CLUB_RESIDENT: {
        id: 'CLUB_RESIDENT',
        name: 'Kaito Nocturne',
        tagline: 'Underground warehouse grooves & seamless deep cuts',
        tone: 'Sleek, technical, atmospheric',
        avatarEmoji: '🎛️',
        samplePhrase: 'Locking into this tempo shift. Catching the wave on deck two.',
    },
    RADIO_HOST: {
        id: 'RADIO_HOST',
        name: 'Aria FM',
        tagline: 'Golden age broadcast voice with personal listener dedications',
        tone: 'Heartfelt, eloquent, storytelling',
        avatarEmoji: '🎙️',
        samplePhrase: 'Broadcasting live to all our listeners across the world... this one is special.',
    },
};
class AIDJEngine {
    /**
     * Generates natural AI DJ commentary for song transitions based on active persona.
     */
    static generateTransitionAnnouncement(options) {
        const { roomId, currentTrack, nextTrack, addedBy, persona = 'RADIO_HOST' } = options;
        const meta = exports.AIDJ_PERSONAS[persona] || exports.AIDJ_PERSONAS.RADIO_HOST;
        let introText = '';
        const requesterClause = addedBy ? ` requested by ${addedBy}` : '';
        switch (persona) {
            case 'LOFI_CHILL':
                introText = currentTrack
                    ? `Sliding smoothly out of "${currentTrack.title}" into "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}. Keep the midnight vibes rolling.`
                    : `Setting the room in motion with "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}. Sit back and breathe.`;
                break;
            case 'HYPE_BEAST':
                introText = currentTrack
                    ? `WOAH! "${currentTrack.title}" was crazy, but up next we got "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}! Let's turn this room UP!`
                    : `AIR HORNS READY! Starting strong with "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}! Let's go!`;
                break;
            case 'CLUB_RESIDENT':
                introText = currentTrack
                    ? `Harmonic mix locking in. Transitioning from "${currentTrack.title}" straight into ${nextTrack.artist}'s "${nextTrack.title}"${requesterClause}. Feel that low-end.`
                    : `Opening the stage with "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}. 124 on the clock.`;
                break;
            case 'RADIO_HOST':
            default:
                introText = currentTrack
                    ? `You're tuned in live with our synchronized room. That was "${currentTrack.title}", and right now we're spinning "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}.`
                    : `Welcome to the frequency. We're kicking off tonight's session with "${nextTrack.title}" by ${nextTrack.artist}${requesterClause}.`;
                break;
        }
        return {
            id: `ann-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            roomId,
            trackId: nextTrack.id,
            trackTitle: nextTrack.title,
            trackArtist: nextTrack.artist,
            introText,
            persona,
            timestamp: Date.now(),
        };
    }
    /**
     * Smart auto-queue replenishment: recommends matching tracks from a catalog pool
     * based on dominant genres and energy of recently played songs.
     */
    static recommendNextTracks(recentTracks, catalogPool, count = 3) {
        if (catalogPool.length === 0)
            return [];
        const playedIds = new Set(recentTracks.map((t) => t.id));
        const available = catalogPool.filter((t) => !playedIds.has(t.id));
        if (available.length <= count)
            return available;
        // Determine target genre from most recent track
        const targetGenre = recentTracks[recentTracks.length - 1]?.genre?.toLowerCase();
        // Sort by matching genre first, fallback to remaining
        const sorted = [...available].sort((a, b) => {
            const aMatches = targetGenre && a.genre?.toLowerCase() === targetGenre ? 1 : 0;
            const bMatches = targetGenre && b.genre?.toLowerCase() === targetGenre ? 1 : 0;
            return bMatches - aMatches;
        });
        return sorted.slice(0, count);
    }
}
exports.AIDJEngine = AIDJEngine;
// ============================================================================
// PHASE 8: GROUP LISTENING MILESTONES & STREAKS
// ============================================================================
exports.DEFAULT_LISTENING_MILESTONES = [
    {
        id: 'm-sync-15',
        title: '15m Synchronized Vibe',
        description: '15 minutes of uninterrupted synchronized group listening.',
        icon: '✨',
        targetValue: 15,
        currentValue: 0,
        achieved: false,
        type: 'SYNC_TIME',
    },
    {
        id: 'm-streak-5',
        title: '5-Song Groove Streak',
        description: 'Listen to 5 consecutive tracks with everyone in the room.',
        icon: '🔥',
        targetValue: 5,
        currentValue: 0,
        achieved: false,
        type: 'STREAK_SONGS',
    },
    {
        id: 'm-anthem-10',
        title: 'Unanimous Anthem',
        description: 'A queued track reaches 10 or more community upvotes.',
        icon: '👑',
        targetValue: 10,
        currentValue: 0,
        achieved: false,
        type: 'UNANIMOUS_UPVOTES',
    },
    {
        id: 'm-marathon-60',
        title: '1-Hour Room Marathon',
        description: '60 minutes of collective musical journey together.',
        icon: '🏆',
        targetValue: 60,
        currentValue: 0,
        achieved: false,
        type: 'MARATHON',
    },
];
class ListeningMilestoneTracker {
    /**
     * Evaluates current session counters and returns updated milestones with new unlocks.
     */
    static evaluateMilestones(session) {
        const list = (session.currentMilestones && session.currentMilestones.length > 0)
            ? session.currentMilestones
            : exports.DEFAULT_LISTENING_MILESTONES;
        const newlyUnlocked = [];
        const updatedMilestones = list.map((m) => {
            let val = m.currentValue;
            switch (m.type) {
                case 'SYNC_TIME':
                case 'MARATHON':
                    val = session.listeningMinutes;
                    break;
                case 'STREAK_SONGS':
                    val = session.tracksPlayedCount;
                    break;
                case 'UNANIMOUS_UPVOTES':
                    val = session.maxTrackUpvotes;
                    break;
            }
            const isAchieved = val >= m.targetValue;
            const justUnlocked = isAchieved && !m.achieved;
            const updated = {
                ...m,
                currentValue: val,
                achieved: isAchieved,
                achievedAt: justUnlocked ? new Date().toISOString() : m.achievedAt,
            };
            if (justUnlocked) {
                newlyUnlocked.push(updated);
            }
            return updated;
        });
        return { updatedMilestones, newlyUnlocked };
    }
}
exports.ListeningMilestoneTracker = ListeningMilestoneTracker;
// ============================================================================
// PHASE 8: 2D INTERACTIVE SPATIAL AUDIO STAGE
// ============================================================================
class SpatialAudioEngine {
    /**
     * Computes stereo pan (-1.0 left to 1.0 right) and distance attenuation gain (0.25 to 1.0)
     * for a participant located at (x, y) relative to the virtual center stage (0, 0).
     */
    static calculateSpatialParameters(x, y, sourceX = 0, sourceY = 0) {
        // Relative coordinates
        const dx = x - sourceX;
        const dy = y - sourceY;
        // Horizontal pan: clamped from -1.0 to 1.0
        const pan = Math.max(-1.0, Math.min(1.0, Math.round((dx / 100) * 100) / 100));
        // Distance in a 200x200 arena (max distance from center is sqrt(100^2 + 100^2) ~= 141.4)
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 141.42;
        // Attenuation formula: closer is louder (1.0 at center, down to 0.25 at edges)
        const normalizedDist = Math.min(1.0, distance / maxDist);
        const distanceGain = Math.round(Math.max(0.25, 1.0 - normalizedDist * 0.75) * 100) / 100;
        return { pan, distanceGain };
    }
    /**
     * Distributes room members in a circular seating arrangement around the central stage.
     */
    static arrangeCircleSeats(members, radius = 65) {
        const total = members.length;
        if (total === 0)
            return [];
        return members.map((m, index) => {
            // Angle evenly spaced around circle starting from top (3pi/2)
            const angle = (2 * Math.PI * index) / total - Math.PI / 2;
            const x = Math.round(radius * Math.cos(angle));
            const y = Math.round(radius * Math.sin(angle));
            const { pan, distanceGain } = this.calculateSpatialParameters(x, y);
            return {
                userId: m.userId,
                displayName: m.displayName,
                avatarUrl: m.avatarUrl,
                x,
                y,
                pan,
                distanceGain,
                isSpeaking: false,
            };
        });
    }
}
exports.SpatialAudioEngine = SpatialAudioEngine;
//# sourceMappingURL=index.js.map