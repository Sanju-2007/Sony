import { TrackMetadata } from "@sony/types";

const YOUTUBE_API_KEY_STORAGE = "sony_youtube_api_key";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationMs: number;
}

// Curated verified YouTube full-length tracks across genres
export const CURATED_YOUTUBE_TRACKS: TrackMetadata[] = [
  {
    id: "yt-4NRXx6U8ABQ",
    provider: "YOUTUBE",
    providerTrackId: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    artworkUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    durationMs: 200000,
    streamUrl: "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
  },
  {
    id: "yt-34Na4j8AVgA",
    provider: "YOUTUBE",
    providerTrackId: "34Na4j8AVgA",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    album: "Starboy",
    artworkUrl: "https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg",
    durationMs: 230000,
    streamUrl: "https://www.youtube.com/watch?v=34Na4j8AVgA",
  },
  {
    id: "yt-5NV6Rdv1a3w",
    provider: "YOUTUBE",
    providerTrackId: "5NV6Rdv1a3w",
    title: "Get Lucky",
    artist: "Daft Punk ft. Pharrell Williams",
    album: "Random Access Memories",
    artworkUrl: "https://i.ytimg.com/vi/5NV6Rdv1a3w/hqdefault.jpg",
    durationMs: 248000,
    streamUrl: "https://www.youtube.com/watch?v=5NV6Rdv1a3w",
  },
  {
    id: "yt-H5v3kku4y6Q",
    provider: "YOUTUBE",
    providerTrackId: "H5v3kku4y6Q",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    artworkUrl: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg",
    durationMs: 167000,
    streamUrl: "https://www.youtube.com/watch?v=H5v3kku4y6Q",
  },
  {
    id: "yt-TUVcZfQe-Kw",
    provider: "YOUTUBE",
    providerTrackId: "TUVcZfQe-Kw",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    artworkUrl: "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg",
    durationMs: 203000,
    streamUrl: "https://www.youtube.com/watch?v=TUVcZfQe-Kw",
  },
  {
    id: "yt-yKNxeF4PqvY",
    provider: "YOUTUBE",
    providerTrackId: "yKNxeF4PqvY",
    title: "Yellow",
    artist: "Coldplay",
    album: "Parachutes",
    artworkUrl: "https://i.ytimg.com/vi/yKNxeF4PqvY/hqdefault.jpg",
    durationMs: 269000,
    streamUrl: "https://www.youtube.com/watch?v=yKNxeF4PqvY",
  },
  {
    id: "yt-b1kbLwvqugk",
    provider: "YOUTUBE",
    providerTrackId: "b1kbLwvqugk",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    artworkUrl: "https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg",
    durationMs: 200000,
    streamUrl: "https://www.youtube.com/watch?v=b1kbLwvqugk",
  },
  {
    id: "yt-DyDfgMOUjCI",
    provider: "YOUTUBE",
    providerTrackId: "DyDfgMOUjCI",
    title: "bad guy",
    artist: "Billie Eilish",
    album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
    artworkUrl: "https://i.ytimg.com/vi/DyDfgMOUjCI/hqdefault.jpg",
    durationMs: 194000,
    streamUrl: "https://www.youtube.com/watch?v=DyDfgMOUjCI",
  },
  {
    id: "yt-BddP6PYo2gs",
    provider: "YOUTUBE",
    providerTrackId: "BddP6PYo2gs",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    album: "Brahmāstra",
    artworkUrl: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg",
    durationMs: 268000,
    streamUrl: "https://www.youtube.com/watch?v=BddP6PYo2gs",
  },
  {
    id: "yt-gdZLi9oWNZg",
    provider: "YOUTUBE",
    providerTrackId: "gdZLi9oWNZg",
    title: "Dynamite",
    artist: "BTS",
    album: "BE",
    artworkUrl: "https://i.ytimg.com/vi/gdZLi9oWNZg/hqdefault.jpg",
    durationMs: 199000,
    streamUrl: "https://www.youtube.com/watch?v=gdZLi9oWNZg",
  },
  {
    id: "yt-jfKfPfyJRdk",
    provider: "YOUTUBE",
    providerTrackId: "jfKfPfyJRdk",
    title: "beats to relax/study to",
    artist: "Lofi Girl",
    album: "Lofi Hip Hop Radio",
    artworkUrl: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    durationMs: 360000,
    streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    id: "yt-4xDzrJKXOOY",
    provider: "YOUTUBE",
    providerTrackId: "4xDzrJKXOOY",
    title: "synthwave radio - chill synth / retrowave",
    artist: "Lofi Girl Synthwave",
    album: "Synthwave Beats",
    artworkUrl: "https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    durationMs: 360000,
    streamUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
  },
  {
    id: "yt-JGwWNGJdvx8",
    provider: "YOUTUBE",
    providerTrackId: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    artworkUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
    durationMs: 233000,
    streamUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
  },
  {
    id: "yt-wXhTHyIgQ_U",
    provider: "YOUTUBE",
    providerTrackId: "wXhTHyIgQ_U",
    title: "Circles",
    artist: "Post Malone",
    album: "Hollywood's Bleeding",
    artworkUrl: "https://i.ytimg.com/vi/wXhTHyIgQ_U/hqdefault.jpg",
    durationMs: 215000,
    streamUrl: "https://www.youtube.com/watch?v=wXhTHyIgQ_U",
  },
  {
    id: "yt-7wtfhZwyrcc",
    provider: "YOUTUBE",
    providerTrackId: "7wtfhZwyrcc",
    title: "Believer",
    artist: "Imagine Dragons",
    album: "Evolve",
    artworkUrl: "https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg",
    durationMs: 204000,
    streamUrl: "https://www.youtube.com/watch?v=7wtfhZwyrcc",
  },
];

class YouTubeMusicService {
  public getStoredApiKey(): string {
    if (typeof window !== "undefined" && window.localStorage) {
      const key = window.localStorage.getItem(YOUTUBE_API_KEY_STORAGE);
      if (key && key.trim()) return key.trim();
    }
    // Fallback to env variable if present
    if (typeof process !== "undefined" && process.env) {
      return (
        process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ||
        process.env.YOUTUBE_API_KEY ||
        ""
      ).trim();
    }
    return "";
  }

  public setStoredApiKey(key: string) {
    if (typeof window !== "undefined" && window.localStorage) {
      if (key && key.trim()) {
        window.localStorage.setItem(YOUTUBE_API_KEY_STORAGE, key.trim());
      } else {
        window.localStorage.removeItem(YOUTUBE_API_KEY_STORAGE);
      }
    }
  }

  public async testApiKey(key: string): Promise<{ valid: boolean; error?: string }> {
    if (!key || !key.trim()) {
      return { valid: false, error: "Please enter an API key." };
    }
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=1&q=music&key=${encodeURIComponent(
          key.trim()
        )}`
      );
      const data = await res.json();
      if (data.error) {
        return {
          valid: false,
          error: data.error.message || "Invalid API key or quota exceeded.",
        };
      }
      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: e?.message || "Failed to reach YouTube API." };
    }
  }

  public async searchTracks(query: string): Promise<TrackMetadata[]> {
    const q = query.trim();
    if (!q) return [];

    const apiKey = this.getStoredApiKey();

    // 1. If YouTube Data API Key is provided, use official endpoint
    if (apiKey) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=25&q=${encodeURIComponent(
          q
        )}&key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.items && Array.isArray(data.items)) {
          return data.items
            .filter((item: any) => item.id?.videoId)
            .map((item: any) => this.mapYouTubeItem(item));
        }
      } catch (err) {
        console.warn("YouTube Data API call failed, falling back:", err);
      }
    }

    // 2. Invidious / Piped search fallback
    const invidiousHosts = [
      "https://yt.artemislena.eu",
      "https://invidious.jing.rocks",
      "https://pipedapi.kavin.rocks",
    ];

    for (const host of invidiousHosts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const url = `${host}/api/v1/search?q=${encodeURIComponent(q)}&type=video`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data
              .filter((item: any) => item.videoId)
              .slice(0, 25)
              .map((item: any) => ({
                id: `yt-${item.videoId}`,
                provider: "YOUTUBE" as const,
                providerTrackId: item.videoId,
                title: this.cleanTitle(item.title || "Untitled"),
                artist: item.author || "YouTube Music",
                album: "YouTube",
                artworkUrl:
                  item.videoThumbnails?.[0]?.url ||
                  `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
                durationMs: (item.lengthSeconds || 210) * 1000,
                streamUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
              }));
          }
        }
      } catch {
        // Try next instance
      }
    }

    // 3. Built-in Curated YouTube search matching
    const qLower = q.toLowerCase();
    const curatedMatches = CURATED_YOUTUBE_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(qLower) ||
        t.artist.toLowerCase().includes(qLower) ||
        t.album?.toLowerCase().includes(qLower)
    );

    if (curatedMatches.length > 0) {
      return curatedMatches;
    }

    // 4. If nothing in curated, generate a search result card for this query on YouTube
    // allowing the user to play the query directly as a YouTube topic search
    return [
      {
        id: `yt-search-${Date.now()}`,
        provider: "YOUTUBE" as const,
        providerTrackId: "4NRXx6U8ABQ", // fallback hit
        title: q,
        artist: "YouTube Music",
        album: "Full Track Audio",
        artworkUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80",
        durationMs: 240000,
        streamUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      },
      ...CURATED_YOUTUBE_TRACKS.slice(0, 6),
    ];
  }

  private mapYouTubeItem(item: any): TrackMetadata {
    const videoId = item.id.videoId;
    const snippet = item.snippet;
    const rawTitle = snippet.title || "Untitled";

    return {
      id: `yt-${videoId}`,
      provider: "YOUTUBE",
      providerTrackId: videoId,
      title: this.cleanTitle(rawTitle),
      artist: snippet.channelTitle || "YouTube Artist",
      album: "YouTube Music",
      artworkUrl:
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      durationMs: 210000, // 3:30 default full length
      streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s*\(Official (Music )?Video\)/gi, "")
      .replace(/\s*\[Official (Music )?Video\]/gi, "")
      .replace(/\s*\(Official Audio\)/gi, "")
      .replace(/\s*\[Official Audio\]/gi, "")
      .replace(/\s*\(Lyric Video\)/gi, "")
      .replace(/\s*\[Lyric Video\]/gi, "")
      .replace(/\s*\(Visualizer\)/gi, "")
      .trim();
  }
}

export const youtubeMusicService = new YouTubeMusicService();
