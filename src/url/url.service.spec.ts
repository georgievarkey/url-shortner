import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlMapping } from '@prisma/client';

jest.mock('../utils/url.utils', () => ({
  generateShortUrl: jest.fn().mockResolvedValue('abc123'),
}));

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockUrl: UrlMapping = {
    id: '1',
    shortUrl: 'abc123',
    longUrl: 'https://example.com',
    userId: null,
    createdAt: new Date(),
    expiresAt: null,
    clickCount: 0,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: {
            urlMapping: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('create', () => {
    it('should create a new URL mapping', async () => {
      const createUrlDto: CreateUrlDto = {
        longUrl: 'https://example.com',
      };

      jest.spyOn(prismaService.urlMapping, 'create').mockResolvedValue(mockUrl);

      const result = await service.create(createUrlDto);

      expect(result).toEqual(mockUrl);
      expect(prismaService.urlMapping.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          longUrl: createUrlDto.longUrl,
          shortUrl: 'abc123',
        }),
      });
      expect(redisService.set).toHaveBeenCalledWith('url:abc123', mockUrl.longUrl);
    });

    it('should handle expiration date', async () => {
      const expiresAt = new Date();
      const createUrlDto: CreateUrlDto = {
        longUrl: 'https://example.com',
        expiresAt,
      };

      const mockUrlWithExpiry: UrlMapping = {
        ...mockUrl,
        expiresAt,
      };

      jest.spyOn(prismaService.urlMapping, 'create').mockResolvedValue(mockUrlWithExpiry);

      const result = await service.create(createUrlDto);

      expect(result.expiresAt).toEqual(expiresAt);
      expect(prismaService.urlMapping.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          longUrl: createUrlDto.longUrl,
          expiresAt,
          shortUrl: 'abc123',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all URL mappings', async () => {
      const mockUrls = [mockUrl];
      jest.spyOn(prismaService.urlMapping, 'findMany').mockResolvedValue(mockUrls);

      const result = await service.findAll();

      expect(result).toEqual(mockUrls);
    });
  });

  describe('findOne', () => {
    it('should return a URL mapping if found', async () => {
      jest.spyOn(prismaService.urlMapping, 'findUnique').mockResolvedValue(mockUrl);

      const result = await service.findOne('abc123');

      expect(result).toEqual(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      jest.spyOn(prismaService.urlMapping, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return URL from cache if available', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue('https://example.com');

      const result = await service.getOriginalUrl('abc123');

      expect(result).toBe('https://example.com');
      expect(prismaService.urlMapping.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch and cache URL if not in cache', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.urlMapping, 'findUnique').mockResolvedValue(mockUrl);

      const result = await service.getOriginalUrl('abc123');

      expect(result).toBe(mockUrl.longUrl);
      expect(redisService.set).toHaveBeenCalledWith('url:abc123', mockUrl.longUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.urlMapping, 'findUnique').mockResolvedValue(null);

      await expect(service.getOriginalUrl('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementClicks', () => {
    it('should increment click count', async () => {
      const updatedMockUrl = { ...mockUrl, clickCount: 1 };
      jest.spyOn(prismaService.urlMapping, 'update').mockResolvedValue(updatedMockUrl);

      await service.incrementClicks('abc123');

      expect(prismaService.urlMapping.update).toHaveBeenCalledWith({
        where: { shortUrl: 'abc123' },
        data: { clickCount: { increment: 1 } },
      });
    });
  });

  describe('deactivateUrl', () => {
    it('should deactivate URL', async () => {
      const deactivatedMockUrl = { ...mockUrl, isActive: false };
      jest.spyOn(prismaService.urlMapping, 'update').mockResolvedValue(deactivatedMockUrl);

      await service.deactivateUrl('abc123');

      expect(prismaService.urlMapping.update).toHaveBeenCalledWith({
        where: { shortUrl: 'abc123' },
        data: { isActive: false },
      });
    });
  });

  describe('remove', () => {
    it('should remove URL mapping and cache', async () => {
      jest.spyOn(prismaService.urlMapping, 'delete').mockResolvedValue(mockUrl);

      await service.remove('abc123');

      expect(prismaService.urlMapping.delete).toHaveBeenCalledWith({
        where: { shortUrl: 'abc123' },
      });
      expect(redisService.del).toHaveBeenCalledWith('url:abc123');
    });
  });
});