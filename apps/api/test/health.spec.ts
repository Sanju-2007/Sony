import { HealthService } from '../src/modules/health/health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockPrisma: any;
  let mockRedis: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    };
    mockRedis = {};
    service = new HealthService(mockPrisma, mockRedis);
  });

  it('reports healthy status when database responds', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.services.database).toBe('UP');
    expect(result.services.redis).toBe('UP');
    expect(result.uptimeSec).toBeGreaterThanOrEqual(0);
  });

  it('reports degraded status when database query fails', async () => {
    mockPrisma.$queryRaw = jest.fn().mockRejectedValue(new Error('Connection lost'));
    const result = await service.check();
    expect(result.status).toBe('degraded');
    expect(result.services.database).toBe('DOWN');
  });
});
