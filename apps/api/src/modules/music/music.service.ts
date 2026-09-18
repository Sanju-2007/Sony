import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TrackMetadata, MusicProviderType } from '@sony/types';
import * as CryptoJS from 'crypto-js';

// Curated royalty-free & licensed catalog
const LICENSED_CATALOG: TrackMetadata[] = [
  {
    id: 'track-ambient-01',
    provider: 'LICENSED_CATALOG',
    providerTrackId: 'track-ambient-01',
    title: 'Midnight Ambient Waves',
    artist: 'Sony Sound Collective',
    album: 'Presence Vol. 1',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&fit=crop&q=80',
    durationMs: 240000,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'track-lofi-02',
    provider: 'LICENSED_CATALOG',
    providerTrackId: 'track-lofi-02',
    title: 'Tokyo Rain & Neon Lights',
    artist: 'Kaito & Maya',
    album: 'Shibuya Midnight',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80',
    durationMs: 195000,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
  },
  {
    id: 'track-synth-03',
    provider: 'LICENSED_CATALOG',
    providerTrackId: 'track-synth-03',
    title: 'Solar Flare Horizon',
    artist: 'Aura Electric',
    album: 'Neon Genesis',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80',
    durationMs: 210000,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3',
  },
  {
    id: 'track-acoustic-04',
    provider: 'LICENSED_CATALOG',
    providerTrackId: 'track-acoustic-04',
    title: 'Paper Boats on the River',
    artist: 'Elena Rostova',
    album: 'Quiet Hours',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80',
    durationMs: 180000,
    streamUrl: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3',
  },
  {
    id: 'track-afterhours-05',
    provider: 'SPOTIFY',
    providerTrackId: 'spotify-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80',
    durationMs: 200000,
    isrc: 'USUM71922301',
  },
];

function cleanTitle(raw: string): string {
  if (!raw) return 'Untitled Track';
  return raw
    .replace(/(\(Official.*?\)|\[Official.*?\]|\(Audio\)|\[Audio\]|\(Visualizer\)|\[Visualizer\]|\(Lyric Video\)|\[Lyric Video\])/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDuration(lengthText?: string): number {
  if (!lengthText) return 210000;
  const parts = lengthText.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return (parts[0] * 60 + parts[1]) * 1000;
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
  }
  return 210000;
}

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);

  /**
   * Search YouTube for full-length video songs to stream audio.
   */
  async searchYouTube(query: string): Promise<TrackMetadata[]> {
    try {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' audio')}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!res.ok) return [];
      const html = await res.text();
      const jsonMatch = html.match(/var ytInitialData = ({.+?});<\/script>/);
      if (!jsonMatch) return [];

      const data = JSON.parse(jsonMatch[1]);
      const contents =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      const results: TrackMetadata[] = [];

      if (contents && Array.isArray(contents)) {
        for (const section of contents) {
          const vItems = section.itemSectionRenderer?.contents || [];
          for (const item of vItems) {
            const vr = item.videoRenderer;
            if (vr && vr.videoId && vr.title) {
              const rawTitle = vr.title?.runs?.[0]?.text || 'Untitled';
              const rawAuthor =
                vr.ownerText?.runs?.[0]?.text ||
                vr.shortBylineText?.runs?.[0]?.text ||
                'YouTube Artist';

              results.push({
                id: `yt-${vr.videoId}`,
                provider: 'YOUTUBE',
                providerTrackId: vr.videoId,
                title: cleanTitle(rawTitle),
                artist: rawAuthor.replace(/ - Topic$/i, '').trim(),
                album: 'YouTube Music Audio',
                artworkUrl: `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
                durationMs: parseDuration(vr.lengthText?.simpleText),
                streamUrl: `https://www.youtube.com/watch?v=${vr.videoId}`,
              });
            }
          }
        }
      }

      return results.slice(0, 25);
    } catch (err: any) {
      this.logger.warn(`YouTube audio search error for "${query}": ${err?.message}`);
      return [];
    }
  }

  async search(query: string, provider?: MusicProviderType): Promise<TrackMetadata[]> {
    const q = (query || '').toLowerCase().trim();

    // 1. Initial filter from local catalog
    const catalogMatches = LICENSED_CATALOG.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album?.toLowerCase().includes(q);

      const matchesProvider = !provider || t.provider === provider;
      return matchesQuery && matchesProvider;
    });

    if (!q) {
      return catalogMatches;
    }

    // 2. Query YouTube video songs for full audio playback
    const ytTracks = await this.searchYouTube(q);
    if (ytTracks && ytTracks.length > 0) {
      return ytTracks;
    }

    return catalogMatches;
  }

  /**
   * Next-time recommendations based on the user's last listened song/artist.
   */
  async getRecommendations(artist?: string, title?: string): Promise<TrackMetadata[]> {
    const query = artist
      ? `${artist} top songs`
      : title
      ? `${title} similar songs`
      : 'top hits music';

    const tracks = await this.searchYouTube(query);
    if (tracks.length > 0) {
      // Exclude exact same title if present so they discover new recommendations
      const cleanedTitle = title?.toLowerCase().trim();
      const filtered = cleanedTitle
        ? tracks.filter((t) => !t.title.toLowerCase().includes(cleanedTitle))
        : tracks;
      return filtered.slice(0, 10);
    }

    return LICENSED_CATALOG.slice(0, 6);
  }

  async getTrack(provider: string, trackId: string): Promise<TrackMetadata> {
    if (provider === 'YOUTUBE' || trackId.startsWith('yt-')) {
      const videoId = trackId.replace(/^yt-/, '');
      return {
        id: `yt-${videoId}`,
        provider: 'YOUTUBE',
        providerTrackId: videoId,
        title: 'YouTube Audio Track',
        artist: 'YouTube Artist',
        album: 'YouTube Music',
        artworkUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        durationMs: 210000,
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }

    const track = LICENSED_CATALOG.find((t) => t.providerTrackId === trackId || t.id === trackId);
    if (!track) {
      throw new NotFoundException(`Track ${trackId} not found for provider ${provider}`);
    }
    return track;
  }

  async getLyrics(title: string, artist?: string, duration?: number) {
    const cleanTitle = (title || '').replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?Video|Official\s*Audio|Lyric\s*Video|Full\s*Audio|Audio|HD|4K|Remastered|Visualizer|Lyrics)[\)\]]/gi, '').trim();
    const cleanArtist = (artist || '').replace(/feat\.?.*$/i, '').trim();

    try {
      const params = new URLSearchParams();
      if (cleanArtist) params.append('artist_name', cleanArtist);
      params.append('track_name', cleanTitle);
      if (duration && duration > 0) params.append('duration', duration.toString());

      const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          title: cleanTitle,
          artist: cleanArtist,
          syncedLyrics: data.syncedLyrics || null,
          plainLyrics: data.plainLyrics || null,
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      title: cleanTitle,
      artist: cleanArtist,
      syncedLyrics: null,
      plainLyrics: null,
    };
  }
}
