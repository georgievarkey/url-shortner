import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import IoRedis from 'ioredis';

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  quit: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
};

// Important: Mock needs to be before any imports
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService', () => {
  let service: RedisService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('redis://localhost:6379'),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);

    // Initialize the service
    await service.onModuleInit();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await service.onModuleDestroy();
  });

  describe('get', () => {
    it('should get a value', async () => {
      const mockValue = 'test-value';
      mockRedisClient.get.mockResolvedValue(mockValue);

      const result = await service.get('test-key');
      expect(result).toBe(mockValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });
  });

  describe('set', () => {
    it('should set a value without TTL', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('test-key', 'test-value');
      expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should set a value with TTL', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('test-key', 'test-value', 60);
      expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', 'test-value', 'EX', 60);
    });
  });

  describe('incr', () => {
    it('should increment a counter', async () => {
      mockRedisClient.incr.mockResolvedValue(1);

      const result = await service.incr('counter-key');
      expect(result).toBe(1);
      expect(mockRedisClient.incr).toHaveBeenCalledWith('counter-key');
    });
  });

  describe('expire', () => {
    it('should set expiration', async () => {
      mockRedisClient.expire.mockResolvedValue(1);

      await service.expire('test-key', 60);
      expect(mockRedisClient.expire).toHaveBeenCalledWith('test-key', 60);
    });
  });

  describe('ttl', () => {
    it('should get TTL', async () => {
      mockRedisClient.ttl.mockResolvedValue(60);

      const result = await service.ttl('test-key');
      expect(result).toBe(60);
      expect(mockRedisClient.ttl).toHaveBeenCalledWith('test-key');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('test-key');
      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });
  });
});