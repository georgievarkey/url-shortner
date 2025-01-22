import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterGuard } from './rate-limiter.guard';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  let redisService: RedisService;
  let configService: ConfigService;

  const mockRedisService = {
    incr: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        'RATE_LIMIT_TTL': 60,
        'RATE_LIMIT_MAX': 100,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterGuard,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<RateLimiterGuard>(RateLimiterGuard);
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow requests within rate limit', async () => {
      const context = createMock<ExecutionContext>();
      const request = {
        ip: '127.0.0.1',
      };

      context.switchToHttp().getRequest.mockReturnValue(request);
      mockRedisService.incr.mockResolvedValue(5);
      mockRedisService.ttl.mockResolvedValue(50);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(redisService.incr).toHaveBeenCalled();
    });

    it('should block requests exceeding rate limit', async () => {
      const context = createMock<ExecutionContext>();
      const request = {
        ip: '127.0.0.1',
      };

      context.switchToHttp().getRequest.mockReturnValue(request);
      mockRedisService.incr.mockResolvedValue(101);
      mockRedisService.ttl.mockResolvedValue(30);

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should set expiry for new keys', async () => {
      const context = createMock<ExecutionContext>();
      const request = {
        ip: '127.0.0.1',
      };

      context.switchToHttp().getRequest.mockReturnValue(request);
      mockRedisService.incr.mockResolvedValue(1);
      mockRedisService.ttl.mockResolvedValue(-2);

      await guard.canActivate(context);

      expect(redisService.expire).toHaveBeenCalled();
    });
  });
});