// ============================================================================
// SHARED TYPES & PROTOCOL CONTRACTS
// ============================================================================

// --- USER & AUTHENTICATION ---
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isPrivate?: boolean;
  email?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

// --- SOCIAL GRAPH & PRESENCE ---
export type FriendshipStatus = 'NONE' | 'PENDING_INCOMING' | 'PENDING_OUTGOING' | 'ACCEPTED' | 'BLOCKED';

export type PresenceStatus = 'ONLINE' | 'LISTENING' | 'IN_ROOM' | 'AWAY' | 'OFFLINE';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  currentRoomId?: string | null;
  currentTrackTitle?: string | null;
  currentArtist?: string | null;
  lastSeenAt: number;
}

// --- ROOM SYSTEM ---
export type RoomType = 'PUBLIC' | 'PRIVATE';
export type RoomStatus = 'ACTIVE' | 'ARCHIVED';
export type RoomRole = 'HOST' | 'MODERATOR' | 'LISTENER';

export interface RoomDetails {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: RoomType;
  ownerId: string;
  coverImageUrl?: string | null;
  maxParticipants: number;
  status: RoomStatus;
  participantCount: number;
  currentTrack?: TrackMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMemberInfo {
  userId: string;
  roomId: string;
  role: RoomRole;
  user: PublicUser;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking?: boolean;
  joinedAt: string;
}

// --- MUSIC & TRACK METADATA ---
export type MusicProviderType = 'APPLE_MUSIC' | 'SPOTIFY' | 'YOUTUBE' | 'LICENSED_CATALOG';

export interface TrackMetadata {
  id: string;
  provider: MusicProviderType;
  providerTrackId: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  durationMs: number;
  previewUrl?: string | null;
  streamUrl?: string | null; // For royalty-free/licensed direct testing
  isrc?: string | null;
  genre?: string | null;
}


// --- SYNCHRONIZED PLAYBACK ENGINE ---
export type PlaybackAction =
  | 'PLAY'
  | 'PAUSE'
  | 'SEEK'
  | 'NEXT'
  | 'PREVIOUS'
  | 'QUEUE_UPDATE'
  | 'TRACK_CHANGED'
  | 'HOST_CHANGED';

export interface PlaybackStateVector {
  roomId: string;
  trackId: string;
  provider: MusicProviderType;
  currentTrack?: TrackMetadata | null;
  isPlaying: boolean;
  positionMs: number;
  playbackRate: number;
  serverTimestamp: number;
  version: number;
  updatedByUserId: string;
}

export interface PlaybackCommandPayload {
  roomId: string;
  action: PlaybackAction;
  trackId?: string;
  positionMs?: number;
  clientTimestamp: number;
  expectedVersion?: number;
}

export interface QueueItemDto {
  id: string;
  roomId: string;
  track: TrackMetadata;
  positionOrder: number;
  addedBy: PublicUser;
  createdAt: string;
}

// --- REALTIME CHAT & REACTIONS ---
export type MessageType = 'TEXT' | 'VOICE' | 'SYSTEM';

export interface ChatMessageDto {
  id: string;
  roomId?: string | null;
  conversationId?: string | null;
  sender: PublicUser;
  content: string;
  type: MessageType;
  voiceMessage?: VoiceMessageMetaDto | null;
  createdAt: string;
}

export interface VoiceMessageMetaDto {
  id: string;
  senderId: string;
  storageKey: string;
  durationSec: number;
  waveformMetadata: number[];
  streamUrl?: string;
  createdAt: string;
}

export interface ReactionBurstPayload {
  userId: string;
  roomId: string;
  emoji: string;
  timestamp: number;
  userDisplayName?: string;
  originX?: number;
  originY?: number;
}

// --- VOICE CHAT & AUDIO DUCKING ---
export interface VoiceSpeakingPayload {
  userId: string;
  roomId: string;
  isSpeaking: boolean;
  audioLevel: number; // 0.0 to 1.0
}

export type DuckingState =
  | 'IDLE'
  | 'VOICE_DETECTED'
  | 'DUCKING'
  | 'VOICE_ACTIVE'
  | 'VOICE_ENDED'
  | 'RESTORING';

export interface DuckingConfig {
  duckedVolume: number;   // e.g. 0.40 (40%)
  normalVolume: number;   // 1.00 (100%)
  attackTimeMs: number;   // e.g. 150ms
  holdTimeMs: number;     // e.g. 800ms
  releaseTimeMs: number;  // e.g. 500ms
}


// --- SYNCHRONIZED LYRICS ---
export interface LyricLine {
  timeMs: number;
  text: string;
  translation?: string;
  isChorus?: boolean;
}

export interface TrackLyrics {
  trackId: string;
  lines: LyricLine[];
}

// --- MODERATION & SOUNDBOARD ---
export type ModerationActionType =
  | "MUTE"
  | "UNMUTE"
  | "PROMOTE_TO_SPEAKER"
  | "DEMOTE_TO_LISTENER"
  | "TRANSFER_HOST"
  | "KICK";

export interface ModerationActionPayload {
  roomId: string;
  targetUserId: string;
  action: ModerationActionType;
  performedByUserId?: string;
}

export interface SoundboardTriggerPayload {
  roomId: string;
  soundId: string;
  soundName: string;
  emoji: string;
  triggeredByUserId: string;
  triggeredByName: string;
  timestamp: number;
}

// --- SOCKET CONTRACTS ---
export interface ClientToServerEvents {
  "soundboard:trigger": (data: { roomId: string; soundId: string; emoji: string; soundName: string }) => void;
  "moderation:action": (data: ModerationActionPayload) => void;
  "queue:add": (data: { roomId: string; track: TrackMetadata }) => void;
  "queue:remove": (data: { roomId: string; queueItemId: string }) => void;
  "queue:upvote": (data: { roomId: string; queueItemId: string }) => void;
  "voice:speaking": (data: { roomId: string; isSpeaking: boolean; audioLevel?: number }) => void;
  'room:join': (data: { roomId: string; inviteCode?: string }) => void;
  'room:leave': (data: { roomId: string }) => void;
  'playback:command': (data: PlaybackCommandPayload) => void;
  'playback:sync_request': (data: { roomId: string; clientTimestamp: number }) => void;
  'chat:send': (data: { roomId: string; content: string; type?: MessageType; voiceMessageId?: string }) => void;
  'chat:typing': (data: { roomId: string; isTyping: boolean }) => void;
  'reaction:send': (data: { roomId: string; emoji: string }) => void;
  'presence:heartbeat': (data: { status: PresenceStatus; currentRoomId?: string }) => void;
  'dedication:send': (data: SongDedication) => void;
  'reaction:super_burst': (data: SuperReactionPayload) => void;
  'dj:trigger_commentary': (data: { roomId: string; announcement: AIDJAnnouncement }) => void;
  'milestone:claim': (data: { roomId: string; milestone: ListeningMilestone }) => void;
  'spatial:position_update': (data: { roomId: string; seat: SpatialSeat }) => void;
}

export interface ServerToClientEvents {
  "soundboard:played": (data: SoundboardTriggerPayload) => void;
  "moderation:event": (data: ModerationActionPayload) => void;
  "queue:updated": (data: { roomId: string; queue: QueueItemDto[] }) => void;
  'room:state': (data: { room: RoomDetails; members: RoomMemberInfo[]; playback: PlaybackStateVector }) => void;
  'room:member_joined': (data: { member: RoomMemberInfo }) => void;
  'room:member_left': (data: { userId: string; reason?: string }) => void;
  'playback:sync': (data: PlaybackStateVector) => void;
  'playback:error': (data: { code: string; message: string }) => void;
  'chat:message': (data: ChatMessageDto) => void;
  'chat:typing': (data: { userId: string; isTyping: boolean }) => void;
  'reaction:burst': (data: ReactionBurstPayload) => void;
  'reaction:super_burst': (data: SuperReactionPayload) => void;
  'dedication:new': (data: SongDedication) => void;
  'dj:announcement': (data: AIDJAnnouncement) => void;
  'milestone:unlocked': (data: { roomId: string; milestone: ListeningMilestone }) => void;
  'spatial:seats_updated': (data: { roomId: string; seats: SpatialSeat[] }) => void;
  'voice:speaking': (data: VoiceSpeakingPayload) => void;
  'presence:update': (data: UserPresence) => void;
  'error': (data: { message: string; code?: string }) => void;
}


// ============================================================================
// PHASE 6: CROSSFADE, AMBIENT SOUNDSCAPES & MUSIC TASTE BLEND
// ============================================================================

export type CrossfadeDurationSec = 0 | 3 | 6 | 9 | 12;

export interface CrossfadeSettings {
  durationSec: CrossfadeDurationSec;
  enabled: boolean;
  curve: 'EQUAL_POWER' | 'LINEAR';
  smartCue: boolean;
}

export interface CrossfadeGains {
  deckAGain: number; // 0.0 to 1.0 (outgoing track)
  deckBGain: number; // 0.0 to 1.0 (incoming track)
  progress: number;  // 0.0 to 1.0
  totalPower: number; // deckAGain^2 + deckBGain^2
}

export type AmbientSoundscapeType = 'RAIN' | 'VINYL' | 'CAFE' | 'TAPE' | 'OFF';

export interface AmbientSoundscapeState {
  type: AmbientSoundscapeType;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
}

export interface TasteProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  topGenres: string[];
  topArtists: string[];
  acousticTendency: number; // 0 (Synthetic/Electronic) to 100 (Acoustic/Analog)
  energyPreference: number; // 0 (Chill/Ambient) to 100 (Peak Hype)
  tempoBpmAvg: number;      // Average preferred BPM
}

export interface TasteBlendResult {
  userA: TasteProfile;
  userB: TasteProfile;
  compatibilityScore: number; // 0 - 100%
  verdict: string;            // e.g. "Cosmic Resonance", "Sonic Soulmates"
  sharedGenres: string[];
  sharedArtists: string[];
  breakdown: {
    genreAffinity: number; // 0 - 100%
    tempoHarmony: number;  // 0 - 100%
    energyBalance: number; // 0 - 100%
  };
  suggestedBlendTracks: TrackMetadata[];
}

// ============================================================================
// PHASE 7: SONG DEDICATIONS, SESSION RECAP & REACTIVE ROOM THEMES
// ============================================================================

export type DedicationBadgeStyle = 'GOLDEN' | 'NEON' | 'HEART' | 'CLASSIC';

export interface SongDedication {
  id: string;
  roomId: string;
  trackId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  toUserName: string;
  message: string;
  badgeStyle: DedicationBadgeStyle;
  createdAt: string;
}

export type SuperReactionType = 'GOLDEN_VINYL' | 'DISCO_BLAST' | 'HEART_BURST' | 'FLAME_SURGE';

export interface SuperReactionPayload {
  userId: string;
  roomId: string;
  type: SuperReactionType;
  userName: string;
  timestamp: number;
}

export interface SessionRecapData {
  roomId: string;
  roomName: string;
  durationMinutes: number;
  totalTracksPlayed: number;
  topTrack: TrackMetadata;
  topUpvotedTrack: {
    track: TrackMetadata;
    upvotes: number;
  };
  dominantGenre: string;
  genrePercentage: number;
  averageBpm: number;
  totalReactions: number;
  mvpChatter: {
    userId: string;
    displayName: string;
    messageCount: number;
  };
  voiceChampion: {
    userId: string;
    displayName: string;
    minutesSpoken: number;
  };
  generatedAt: string;
}

export type RoomThemeId = 'MONOCHROME' | 'CYBER_NEON' | 'SUNSET_ANALOG' | 'ARCTIC_AURORA';

export interface RoomThemeConfig {
  id: RoomThemeId;
  name: string;
  subtitle: string;
  background: string;
  surface: string;
  surfaceHover: string;
  card: string;
  accent: string;
  accentGlow: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  particleActive: string;
}

// ============================================================================
// PHASE 8: AI COLLABORATIVE DJ, LISTENING MILESTONES & SPATIAL STAGE
// ============================================================================

export type AIDJPersona = 'LOFI_CHILL' | 'HYPE_BEAST' | 'CLUB_RESIDENT' | 'RADIO_HOST';

export interface AIDJConfig {
  enabled: boolean;
  persona: AIDJPersona;
  autoQueueReplenish: boolean;
  voiceCommentary: boolean;
}

export interface AIDJAnnouncement {
  id: string;
  roomId: string;
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  introText: string;
  persona: AIDJPersona;
  timestamp: number;
}

export type MilestoneType = 'SYNC_TIME' | 'STREAK_SONGS' | 'UNANIMOUS_UPVOTES' | 'MARATHON';

export interface ListeningMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetValue: number;
  currentValue: number;
  achieved: boolean;
  achievedAt?: string;
  type: MilestoneType;
}

export interface SpatialSeat {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  x: number; // -100 to 100 on virtual stage
  y: number; // -100 to 100 on virtual stage
  pan: number; // -1.0 (far left) to 1.0 (far right)
  distanceGain: number; // 0.2 to 1.0 attenuation gain
  isSpeaking?: boolean;
}


