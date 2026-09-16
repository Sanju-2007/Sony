import { MusicService } from '../src/modules/music/music.service';

describe('MusicService Catalog & Search', () => {
  let service: MusicService;

  beforeEach(() => {
    service = new MusicService();
  });

  it('searches tracks by title or artist', async () => {
    const results = await service.search('ambient');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase()).toContain('ambient');
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
});
