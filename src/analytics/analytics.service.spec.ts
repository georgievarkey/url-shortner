import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  // Create mock services
  const mockPrismaService = {
    urlMapping: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    urlAnalytics: {
      create: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackClick', () => {
    it('should track a click event', async () => {
      const shortUrl = 'abc123';
      const urlId = 'url-id-1';
      const event = {
        referrer: 'https://example.com',
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      };

      // Mock the URL lookup
      mockPrismaService.urlMapping.findUnique.mockResolvedValue({
        id: urlId,
        shortUrl,
      });

      // Mock the analytics creation
      mockPrismaService.urlAnalytics.create.mockResolvedValue({
        id: 'analytics-1',
        urlMappingId: urlId,
        ...event,
      });

      await service.trackClick(shortUrl, event);

      expect(prismaService.urlMapping.findUnique).toHaveBeenCalledWith({
        where: { shortUrl },
      });

      expect(prismaService.urlAnalytics.create).toHaveBeenCalledWith({
        data: {
          urlMappingId: urlId,
          referrer: event.referrer,
          userAgent: event.userAgent,
          ipAddress: event.ipAddress,
        },
      });

      expect(redisService.incr).toHaveBeenCalledWith(`clicks:${shortUrl}`);
    });

    it('should not create analytics if URL does not exist', async () => {
      const shortUrl = 'nonexistent';
      const event = {
        referrer: 'https://example.com',
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      };

      mockPrismaService.urlMapping.findUnique.mockResolvedValue(null);

      await service.trackClick(shortUrl, event);

      expect(prismaService.urlAnalytics.create).not.toHaveBeenCalled();
      expect(redisService.incr).not.toHaveBeenCalled();
    });
  });

  describe('getUrlStats', () => {
    it('should return url statistics', async () => {
      const shortUrl = 'abc123';
      const mockAnalytics = [
        {
          clickedAt: new Date(),
          referrer: 'https://google.com',
          userAgent: 'Chrome',
        },
      ];

      mockPrismaService.urlMapping.findUnique.mockResolvedValue({
        id: '1',
        shortUrl,
        analytics: mockAnalytics,
      });

      mockRedisService.get.mockResolvedValue('100');

      const result = await service.getUrlStats(shortUrl);

      expect(result).toBeDefined();
      expect(result.totalClicks).toBe(100);
      expect(result.dailyClicks).toBeDefined();
      expect(result.topReferrers).toBeDefined();
      expect(result.browsers).toBeDefined();
    });

    it('should return null for non-existent URL', async () => {
      const shortUrl = 'nonexistent';

      mockPrismaService.urlMapping.findUnique.mockResolvedValue(null);

      const result = await service.getUrlStats(shortUrl);

      expect(result).toBeNull();
    });
  });
});