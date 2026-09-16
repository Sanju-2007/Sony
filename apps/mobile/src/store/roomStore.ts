import { create } from 'zustand';
import { RoomDetails, RoomMemberInfo, ChatMessageDto, ReactionBurstPayload, SuperReactionPayload } from '@sony/types';


interface RoomStoreState {
  currentRoom: RoomDetails | null;
  members: RoomMemberInfo[];
  messages: ChatMessageDto[];
  reactions: ReactionBurstPayload[];
  activeSuperReaction: SuperReactionPayload | null;
  isVoiceMuted: boolean;
  isSingTogetherEnabled: boolean;

  setRoom: (room: RoomDetails, members: RoomMemberInfo[]) => void;
  addMessage: (msg: ChatMessageDto) => void;
  addReaction: (rx: ReactionBurstPayload) => void;
  removeReaction: (timestamp: number) => void;
  setSuperReaction: (rx: SuperReactionPayload | null) => void;
  toggleMute: () => void;
  toggleSingTogether: () => void;
}


export const useRoomStore = create<RoomStoreState>((set) => ({
  currentRoom: {
    id: 'room-late-night-1',
    name: 'Late Night Listening',
    slug: 'late-night-listening-abc',
    description: 'Chill beats, ambient vibes and real conversations.',
    type: 'PUBLIC',
    ownerId: 'user-preview-1',
    maxParticipants: 50,
    participantCount: 4,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  members: [
    {
      userId: 'user-preview-1',
      roomId: 'room-late-night-1',
      role: 'HOST',
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      joinedAt: new Date().toISOString(),
      user: { id: 'user-preview-1', username: 'sanju', displayName: 'Sanju' },
    },
    {
      userId: 'user-2',
      roomId: 'room-late-night-1',
      role: 'LISTENER',
      isMuted: true,
      isDeafened: false,
      isSpeaking: false,
      joinedAt: new Date().toISOString(),
      user: { id: 'user-2', username: 'aisha', displayName: 'Aisha' },
    },
    {
      userId: 'user-3',
      roomId: 'room-late-night-1',
      role: 'LISTENER',
      isMuted: false,
      isDeafened: false,
      isSpeaking: true, // Speaking right now!
      joinedAt: new Date().toISOString(),
      user: { id: 'user-3', username: 'rahul', displayName: 'Rahul' },
    },
    {
      userId: 'user-4',
      roomId: 'room-late-night-1',
      role: 'LISTENER',
      isMuted: true,
      isDeafened: false,
      isSpeaking: false,
      joinedAt: new Date().toISOString(),
      user: { id: 'user-4', username: 'priya', displayName: 'Priya' },
    },
  ],
  messages: [
    {
      id: 'm1',
      content: 'This bassline transition is unbelievable 🔥',
      type: 'TEXT',
      sender: { id: 'user-3', username: 'rahul', displayName: 'Rahul' },
      createdAt: '10:32 PM',
    },
    {
      id: 'm2',
      content: 'Volume ducks automatically when you speak, so smooth!',
      type: 'TEXT',
      sender: { id: 'user-preview-1', username: 'sanju', displayName: 'Sanju' },
      createdAt: '10:33 PM',
    },
  ],
  reactions: [],
  activeSuperReaction: null,
  isVoiceMuted: false,
  isSingTogetherEnabled: true,

  setRoom: (room, members) => set({ currentRoom: room, members }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  addReaction: (rx) => set((s) => ({ reactions: [...s.reactions.slice(-12), rx] })),
  removeReaction: (ts) => set((s) => ({ reactions: s.reactions.filter((r) => r.timestamp !== ts) })),
  setSuperReaction: (rx) => set({ activeSuperReaction: rx }),
  toggleMute: () => set((s) => ({ isVoiceMuted: !s.isVoiceMuted })),
  toggleSingTogether: () => set((s) => ({ isSingTogetherEnabled: !s.isSingTogetherEnabled })),
}));

