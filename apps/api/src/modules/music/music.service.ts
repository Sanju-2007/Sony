import { Injectable, NotFoundException } from '@nestjs/common';
import { TrackMetadata, MusicProviderType } from '@sony/types';

// Curated royalty-free & licensed ambient/lofi/synthwave catalog for instantaneous multi-device testing
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

@Injectable()
export class MusicService {
  async search(query: string, provider?: MusicProviderType): Promise<TrackMetadata[]> {
    const q = (query || '').toLowerCase().trim();
    return LICENSED_CATALOG.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q);

      const matchesProvider = !provider || t.provider === provider;
      return matchesQuery && matchesProvider;
    });
  }

  async getTrack(provider: string, trackId: string): Promise<TrackMetadata> {
    const track = LICENSED_CATALOG.find((t) => t.providerTrackId === trackId || t.id === trackId);
    if (!track) {
      throw new NotFoundException(`Track ${trackId} not found for provider ${provider}`);
    }
    return track;
  }
}
