import { TrackMetadata } from "@sony/types";
import { api } from "./apiClient";
import { youtubeMusicService } from "./youtubeMusicService";

const LAST_PLAYED_KEY = "sony_last_played_track";

class FreeMusicService {
  /**
   * Search for YouTube video songs for audio playback.
   */
  async searchTracks(query: string): Promise<TrackMetadata[]> {
    const q = query.trim();
    if (!q) return [];

    // 1. Try Backend API endpoint (/music/search)
    try {
      const backendResults = await api.searchMusic(q);
      if (Array.isArray(backendResults) && backendResults.length > 0) {
        return backendResults;
      }
    } catch (backendErr) {
      console.warn("Backend music search fallback:", backendErr);
    }

    // 2. Client-side YouTube query fallback
    try {
      const ytResults = await youtubeMusicService.searchTracks(q);
      if (ytResults && ytResults.length > 0) {
        return ytResults;
      }
    } catch (directErr) {
      console.warn("Direct YouTube search fallback error:", directErr);
    }

    return [];
  }

  /**
   * Get recommendations dynamically based on a previously played song.
   */
  async getRecommendations(artist?: string, title?: string): Promise<TrackMetadata[]> {
    try {
      const recs = await api.getRecommendations(artist, title);
      if (Array.isArray(recs) && recs.length > 0) {
        return recs;
      }
    } catch (err) {
      console.warn("Backend recommendations query fallback:", err);
    }

    if (artist) {
      return this.searchTracks(`${artist} songs`);
    }
    return [];
  }

  /**
   * Retrieve the last played track from storage
   */
  getLastPlayedTrack(): TrackMetadata | null {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const item = window.localStorage.getItem(LAST_PLAYED_KEY);
        if (item) {
          return JSON.parse(item);
        }
      } catch {}
    }
    return null;
  }

  /**
   * Save the last played track to storage
   */
  setLastPlayedTrack(track: TrackMetadata | null) {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        if (track) {
          window.localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(track));
        } else {
          window.localStorage.removeItem(LAST_PLAYED_KEY);
        }
      } catch {}
    }
  }
}

export const freeMusicService = new FreeMusicService();
export const FEATURED_FULL_AUDIO_TRACKS: TrackMetadata[] = [];
