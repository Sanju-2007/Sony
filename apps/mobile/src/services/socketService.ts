import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  PlaybackCommandPayload,
  PlaybackStateVector,
  ChatMessageDto,
  ReactionBurstPayload,
  RoomMemberInfo,
  RoomDetails,
  QueueItemDto,
  TrackMetadata,
  VoiceSpeakingPayload,
  SongDedication,
  SuperReactionPayload,
  AIDJAnnouncement,
  ListeningMilestone,
  SpatialSeat,
} from '@sony/types';
import { useRoomStore } from '../store/roomStore';
import { usePlaybackStore } from '../store/playbackStore';
import { useRoomThemeStore } from '../store/roomThemeStore';

export const getWsUrl = (): string => {
  if (process.env.EXPO_PUBLIC_WS_URL) {
    return process.env.EXPO_PUBLIC_WS_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;
    // Standard dev bundler ports
    if (port === '8081' || port === '19006' || port === '19000') {
      return `${protocol}//${hostname}:4000/realtime`;
    }
    // Production web deployment (e.g. served via reverse proxy or same host)
    if (port && port !== '80' && port !== '443') {
      return `${protocol}//${hostname}:4000/realtime`;
    }
    return `${protocol}//${hostname}/realtime`;
  }
  return 'http://localhost:4000/realtime';
};

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket && this.isConnected) return;

    this.socket = io(getWsUrl(), {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[Realtime] Connected to socket gateway');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[Realtime] Disconnected:', reason);
    });

    // Room state events
    this.socket.on('room:state', (data: { room: RoomDetails; members: RoomMemberInfo[]; playback: PlaybackStateVector }) => {
      useRoomStore.getState().setRoom(data.room, data.members);
      usePlaybackStore.getState().setPlaybackVector(data.playback);
    });

    this.socket.on('room:member_joined', (data: { member: RoomMemberInfo }) => {
      const current = useRoomStore.getState().members;
      if (!current.some((m) => m.userId === data.member.userId)) {
        useRoomStore.setState({ members: [...current, data.member] });
      }
    });

    this.socket.on('room:member_left', (data: { userId: string }) => {
      const current = useRoomStore.getState().members;
      useRoomStore.setState({ members: current.filter((m) => m.userId !== data.userId) });
    });

    // Synchronized playback events
    this.socket.on('playback:sync', (data: PlaybackStateVector) => {
      usePlaybackStore.getState().setPlaybackVector(data);
    });

    // Chat events
    this.socket.on('chat:message', (data: ChatMessageDto) => {
      useRoomStore.getState().addMessage(data);
    });

    // Reaction bursts
    this.socket.on('reaction:burst', (data: ReactionBurstPayload) => {
      useRoomStore.getState().addReaction(data);
    });

    // Collaborative Queue updates
    this.socket.on("queue:updated", (data: { roomId: string; queue: QueueItemDto[] }) => {
      usePlaybackStore.setState({
        queue: data.queue.map((q) => ({
          ...q,
          upvotes: (q as any).upvotes || 1,
          hasUpvoted: false,
        })),
      });
    });

    // Remote Voice Speaking event -> Triggers client ducking!
    this.socket.on("voice:speaking", (data: VoiceSpeakingPayload) => {
      // Update speaking state for the member in room roster
      const members = useRoomStore.getState().members;
      useRoomStore.setState({
        members: members.map((m) =>
          m.userId === data.userId ? { ...m, isSpeaking: data.isSpeaking } : m
        ),
      });

      // Trigger automatic audio ducking on local playback!
      usePlaybackStore.getState().setVoiceActive(data.isSpeaking);
    });

    // Song Dedications in real-time
    this.socket.on("dedication:new", (data: SongDedication) => {
      useRoomThemeStore.getState().addDedication(data);
    });

    // Super Reaction Bursts in real-time
    this.socket.on("reaction:super_burst", (data: SuperReactionPayload) => {
      useRoomStore.getState().setSuperReaction(data);
    });

    // AI DJ Announcements in real-time
    this.socket.on("dj:announcement", (data: AIDJAnnouncement) => {
      useRoomStore.getState().setActiveAnnouncement(data);
    });

    // Group Listening Milestones in real-time
    this.socket.on("milestone:unlocked", (data: { roomId: string; milestone: ListeningMilestone }) => {
      useRoomStore.getState().unlockMilestone(data.milestone.id);
    });

    // 2D Spatial Audio Stage seats updated
    this.socket.on("spatial:seats_updated", (data: { roomId: string; seats: SpatialSeat[] }) => {
      useRoomStore.getState().setSpatialSeats(data.seats);
    });

  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(roomId: string, inviteCode?: string) {
    this.socket?.emit('room:join', { roomId, inviteCode });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('room:leave', { roomId });
  }

  sendPlaybackCommand(payload: PlaybackCommandPayload) {
    this.socket?.emit('playback:command', payload);
  }

  sendChatMessage(roomId: string, content: string, type: 'TEXT' | 'VOICE' = 'TEXT', voiceMessageId?: string) {
    this.socket?.emit('chat:send', { roomId, content, type, voiceMessageId });
  }

  sendReaction(roomId: string, emoji: string) {
    this.socket?.emit('reaction:send', { roomId, emoji });
  }

  addToQueue(roomId: string, track: TrackMetadata) {
    this.socket?.emit("queue:add", { roomId, track });
  }

  removeFromQueue(roomId: string, queueItemId: string) {
    this.socket?.emit("queue:remove", { roomId, queueItemId });
  }

  upvoteQueueItem(roomId: string, queueItemId: string) {
    this.socket?.emit("queue:upvote", { roomId, queueItemId });
  }

  sendVoiceSpeaking(roomId: string, isSpeaking: boolean, audioLevel: number = 0.8) {
    this.socket?.emit("voice:speaking", { roomId, isSpeaking, audioLevel });
  }

  sendDedication(data: SongDedication) {
    this.socket?.emit("dedication:send", data);
  }

  sendSuperReaction(data: SuperReactionPayload) {
    this.socket?.emit("reaction:super_burst", data);
  }

  sendDJCommentary(roomId: string, announcement: AIDJAnnouncement) {
    this.socket?.emit("dj:trigger_commentary", { roomId, announcement });
  }

  claimMilestone(roomId: string, milestone: ListeningMilestone) {
    this.socket?.emit("milestone:claim", { roomId, milestone });
  }

  updateSpatialPosition(roomId: string, seat: SpatialSeat) {
    this.socket?.emit("spatial:position_update", { roomId, seat });
  }
}

export const socketService = new SocketService();
