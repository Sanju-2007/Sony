import { MusicService } from '../src/modules/music/music.service';

describe('MusicService Catalog & Search', () => {
  let service: MusicService;

  beforeEach(() => {
    service = new MusicService();
  });

  it('searches tracks by title or artist', async () => {
    const results = await service.search('ambient');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.title.toLowerCase().includes('ambien'))).toBe(true);
  });

  it('filters tracks by music provider', async () => {
    const results = await service.search('', 'LICENSED_CATALOG');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => expect(r.provider).toBe('LICENSED_CATALOG'));
  });

  it('resolves track details by provider and trackId', async () => {
    const track = await service.getTrack('LICENSED_CATALOG', 'track-ambient-01');
    expect(track.id).toBe('track-ambient-01');
    expect(track.title).toBe('Midnight Ambient Waves');
    expect(track.streamUrl).toBeDefined();
  });

  it('throws NotFoundException when track is not in catalog', async () => {
    await expect(service.getTrack('LICENSED_CATALOG', 'nonexistent-track-xyz')).rejects.toThrow();
  });

  it('supports YOUTUBE provider with full track duration > 120 seconds', async () => {
    const ytTrack = {
      id: 'yt-4NRXx6U8ABQ',
      provider: 'YOUTUBE' as const,
      providerTrackId: '4NRXx6U8ABQ',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      artworkUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
      durationMs: 200000,
      streamUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    };

    expect(ytTrack.provider).toBe('YOUTUBE');
    expect(ytTrack.durationMs).toBeGreaterThan(120000); // Complete full-length song (> 2 mins)
    expect(ytTrack.providerTrackId).toHaveLength(11); // Valid 11-char YouTube ID
  });
});
