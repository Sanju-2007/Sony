import {
  AuthResponse,
  PublicUser,
  RoomDetails,
  RoomMemberInfo,
  TrackMetadata,
  MusicProviderType,
} from '@sony/types';

export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;
    // Local dev metro/bundler ports
    if (port === '8081' || port === '19006' || port === '19000') {
      return `${protocol}//${hostname}:4000/api/v1`;
    }
    // Production web deployment (e.g. served via reverse proxy or same host)
    if (port && port !== '80' && port !== '443') {
      return `${protocol}//${hostname}:4000/api/v1`;
    }
    return `${protocol}//${hostname}/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
};

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // AUTH
  async sendOtp(email: string): Promise<{ success: boolean; message: string; code?: string; previewUrl?: string }> {
    return this.request<{ success: boolean; message: string; code?: string; previewUrl?: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, code: string): Promise<{ success: boolean; valid: boolean }> {
    return this.request<{ success: boolean; valid: boolean }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async register(data: { username: string; email: string; password: string; displayName: string; otp?: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { login: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ROOMS
  async getPublicRooms(limit = 20): Promise<RoomDetails[]> {
    return this.request<RoomDetails[]>(`/rooms?limit=${limit}`);
  }

  async getRoomDetails(roomId: string): Promise<{ room: RoomDetails; members: RoomMemberInfo[] }> {
    return this.request<{ room: RoomDetails; members: RoomMemberInfo[] }>(`/rooms/${roomId}`);
  }

  async createRoom(data: { name: string; description?: string; type: 'PUBLIC' | 'PRIVATE' }): Promise<RoomDetails> {
    return this.request<RoomDetails>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinRoom(roomId: string, inviteCode?: string): Promise<RoomMemberInfo> {
    return this.request<RoomMemberInfo>(`/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveRoom(roomId: string): Promise<{ newHostId?: string }> {
    return this.request<{ newHostId?: string }>(`/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  async getVoiceToken(roomId: string): Promise<{ token: string; serverUrl: string; participantId: string }> {
    return this.request<{ token: string; serverUrl: string; participantId: string }>(`/rooms/${roomId}/voice-token`, {
      method: 'POST',
    });
  }

  // MUSIC
  async searchMusic(query: string, provider?: MusicProviderType): Promise<TrackMetadata[]> {
    const params = new URLSearchParams({ q: query });
    if (provider) params.append('provider', provider);
    return this.request<TrackMetadata[]>(`/music/search?${params.toString()}`);
  }

  async getRecommendations(artist?: string, title?: string): Promise<TrackMetadata[]> {
    const params = new URLSearchParams();
    if (artist) params.append('artist', artist);
    if (title) params.append('title', title);
    return this.request<TrackMetadata[]>(`/music/recommendations?${params.toString()}`);
  }

  // FRIENDS
  async getFriends(): Promise<any[]> {
    return this.request<any[]>('/friends');
  }

  async sendFriendRequest(targetUserId: string): Promise<{ success: boolean; friendshipId: string }> {
    return this.request<{ success: boolean; friendshipId: string }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }
}

export const api = new ApiClient();
