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

// --- SOCKET CONTRACTS ---
export interface ClientToServerEvents {
  'room:join': (data: { roomId: string; inviteCode?: string }) => void;
  'room:leave': (data: { roomId: string }) => void;
  'playback:command': (data: PlaybackCommandPayload) => void;
  'playback:sync_request': (data: { roomId: string; clientTimestamp: number }) => void;
  'chat:send': (data: { roomId: string; content: string; type?: MessageType; voiceMessageId?: string }) => void;
  'chat:typing': (data: { roomId: string; isTyping: boolean }) => void;
  'reaction:send': (data: { roomId: string; emoji: string }) => void;
  'presence:heartbeat': (data: { status: PresenceStatus; currentRoomId?: string }) => void;
}

export interface ServerToClientEvents {
  'room:state': (data: { room: RoomDetails; members: RoomMemberInfo[]; playback: PlaybackStateVector }) => void;
  'room:member_joined': (data: { member: RoomMemberInfo }) => void;
  'room:member_left': (data: { userId: string; reason?: string }) => void;
  'playback:sync': (data: PlaybackStateVector) => void;
  'playback:error': (data: { code: string; message: string }) => void;
  'chat:message': (data: ChatMessageDto) => void;
  'chat:typing': (data: { userId: string; isTyping: boolean }) => void;
  'reaction:burst': (data: ReactionBurstPayload) => void;
  'voice:speaking': (data: VoiceSpeakingPayload) => void;
  'presence:update': (data: UserPresence) => void;
  'error': (data: { message: string; code?: string }) => void;
}
