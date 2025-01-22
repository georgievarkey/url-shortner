import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response } from 'express';
import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';
import { NotFoundException } from '@nestjs/common';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            getOriginalUrl: jest.fn(),
            incrementClicks: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
            expire: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'RATE_LIMIT_TTL':
                  return 60;
                case 'RATE_LIMIT_MAX':
                  return 100;
                default:
                  return null;
              }
            }),
          },
        },
        RateLimiterGuard,
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a short URL', async () => {
      const createUrlDto: CreateUrlDto = {
        longUrl: 'https://example.com',
      };

      const mockUrl = {
        id: '1',
        shortUrl: 'abc123',
        longUrl: 'https://example.com',
        userId: null,
        createdAt: new Date(),
        expiresAt: null,
        clickCount: 0,
        isActive: true,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUrl);

      const result = await controller.create(createUrlDto);
      expect(result).toEqual(mockUrl);
      expect(service.create).toHaveBeenCalledWith(createUrlDto);
    });
  });

  describe('redirect', () => {
    it('should redirect to the long URL', async () => {
      const shortUrl = 'abc123';
      const longUrl = 'https://example.com';
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      jest.spyOn(service, 'getOriginalUrl').mockResolvedValue(longUrl);
      jest.spyOn(service, 'incrementClicks').mockResolvedValue(undefined);

      await controller.redirect(shortUrl, mockResponse);
      
      expect(service.getOriginalUrl).toHaveBeenCalledWith(shortUrl);
      expect(service.incrementClicks).toHaveBeenCalledWith(shortUrl);
      expect(mockResponse.redirect).toHaveBeenCalledWith(302, longUrl);
    });

    it('should throw NotFoundException when URL not found', async () => {
      const shortUrl = 'nonexistent';
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      jest.spyOn(service, 'getOriginalUrl').mockRejectedValue(new NotFoundException());

      await expect(controller.redirect(shortUrl, mockResponse))
        .rejects
        .toThrow(NotFoundException);
      
      expect(service.incrementClicks).not.toHaveBeenCalled();
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });
  });
});