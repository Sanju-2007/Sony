import { create } from 'zustand';
import {
  RoomDetails,
  RoomMemberInfo,
  ChatMessageDto,
  ReactionBurstPayload,
  SuperReactionPayload,
  AIDJConfig,
  AIDJAnnouncement,
  ListeningMilestone,
  SpatialSeat,
} from '@sony/types';
import { DEFAULT_LISTENING_MILESTONES, SpatialAudioEngine } from '@sony/music-core';

interface RoomStoreState {
  currentRoom: RoomDetails | null;
  members: RoomMemberInfo[];
  messages: ChatMessageDto[];
  reactions: ReactionBurstPayload[];
  activeSuperReaction: SuperReactionPayload | null;
  aiDJConfig: AIDJConfig;
  activeAnnouncement: AIDJAnnouncement | null;
  milestones: ListeningMilestone[];
  spatialSeats: SpatialSeat[];
  isVoiceMuted: boolean;
  isSingTogetherEnabled: boolean;

  setRoom: (room: RoomDetails, members: RoomMemberInfo[]) => void;
  addMessage: (msg: ChatMessageDto) => void;
  addReaction: (rx: ReactionBurstPayload) => void;
  removeReaction: (timestamp: number) => void;
  setSuperReaction: (rx: SuperReactionPayload | null) => void;
  setAIDJConfig: (cfg: Partial<AIDJConfig>) => void;
  setActiveAnnouncement: (announcement: AIDJAnnouncement | null) => void;
  setMilestones: (milestones: ListeningMilestone[]) => void;
  unlockMilestone: (milestoneId: string) => void;
  setSpatialSeats: (seats: SpatialSeat[]) => void;
  updateUserSeat: (seat: SpatialSeat) => void;
  toggleMute: () => void;
  toggleSingTogether: () => void;
}


export const useRoomStore = create<RoomStoreState>((set) => ({
  currentRoom: null,
  members: [],
  messages: [],
  reactions: [],
  activeSuperReaction: null,
  aiDJConfig: {
    enabled: true,
    persona: 'RADIO_HOST',
    autoQueueReplenish: true,
    voiceCommentary: true,
  },
  activeAnnouncement: null,
  milestones: DEFAULT_LISTENING_MILESTONES,
  spatialSeats: [],
  isVoiceMuted: false,
  isSingTogetherEnabled: true,

  setRoom: (room, members) => set({ currentRoom: room, members }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  addReaction: (rx) => set((s) => ({ reactions: [...s.reactions.slice(-12), rx] })),
  removeReaction: (ts) => set((s) => ({ reactions: s.reactions.filter((r) => r.timestamp !== ts) })),
  setSuperReaction: (rx) => set({ activeSuperReaction: rx }),
  setAIDJConfig: (cfg) => set((s) => ({ aiDJConfig: { ...s.aiDJConfig, ...cfg } })),
  setActiveAnnouncement: (announcement) => set({ activeAnnouncement: announcement }),
  setMilestones: (milestones) => set({ milestones }),
  unlockMilestone: (id) =>
    set((s) => ({
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, achieved: true, achievedAt: new Date().toISOString() } : m
      ),
    })),
  setSpatialSeats: (seats) => set({ spatialSeats: seats }),
  updateUserSeat: (seat) =>
    set((s) => ({
      spatialSeats: s.spatialSeats.some((existing) => existing.userId === seat.userId)
        ? s.spatialSeats.map((existing) => (existing.userId === seat.userId ? seat : existing))
        : [...s.spatialSeats, seat],
    })),
  toggleMute: () => set((s) => ({ isVoiceMuted: !s.isVoiceMuted })),
  toggleSingTogether: () => set((s) => ({ isSingTogetherEnabled: !s.isSingTogetherEnabled })),
}));

