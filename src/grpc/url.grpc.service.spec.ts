import { Test, TestingModule } from '@nestjs/testing';
import { UrlGrpcService } from './url.grpc.service';
import { UrlService } from '../url/url.service';
import { UrlMapping } from '@prisma/client';
import { CreateUrlRequest, GetUrlRequest } from './interfaces/url.interface';

describe('UrlGrpcService', () => {
  let service: UrlGrpcService;
  let urlService: UrlService;

  const mockUrl: UrlMapping = {
    id: '1',
    shortUrl: 'abc123',
    longUrl: 'https://example.com',
    userId: null,
    createdAt: new Date('2024-01-01'),
    expiresAt: null,
    clickCount: 0,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlGrpcService,
        {
          provide: UrlService,
          useValue: {
            createShortUrl: jest.fn(),
            getUrlByShortUrl: jest.fn(),
            deactivateUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlGrpcService>(UrlGrpcService);
    urlService = module.get<UrlService>(UrlService);
  });

  describe('createShortUrl', () => {
    it('should create a short URL', async () => {
      const createRequest: CreateUrlRequest = {
        longUrl: 'https://example.com',
      };

      jest.spyOn(urlService, 'createShortUrl').mockResolvedValue(mockUrl);

      const result = await service.createShortUrl(createRequest);

      expect(result).toEqual({
        shortUrl: mockUrl.shortUrl,
        longUrl: mockUrl.longUrl,
        createdAt: mockUrl.createdAt.toISOString(),
        expiresAt: undefined,
        clickCount: mockUrl.clickCount.toString(),
        isActive: mockUrl.isActive,
      });

      expect(urlService.createShortUrl).toHaveBeenCalledWith({
        longUrl: createRequest.longUrl,
        expiresAt: undefined,
      });
    });

    it('should handle URL with expiration', async () => {
      const expiresAt = new Date('2024-12-31');
      const createRequest: CreateUrlRequest = {
        longUrl: 'https://example.com',
        expiresAt: expiresAt.toISOString(),
      };

      const mockUrlWithExpiry: UrlMapping = {
        ...mockUrl,
        expiresAt,
      };

      jest.spyOn(urlService, 'createShortUrl').mockResolvedValue(mockUrlWithExpiry);

      const result = await service.createShortUrl(createRequest);

      expect(result).toEqual({
        shortUrl: mockUrlWithExpiry.shortUrl,
        longUrl: mockUrlWithExpiry.longUrl,
        createdAt: mockUrlWithExpiry.createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        clickCount: mockUrlWithExpiry.clickCount.toString(),
        isActive: mockUrlWithExpiry.isActive,
      });
    });

    it('should handle error during URL creation', async () => {
      const createRequest: CreateUrlRequest = {
        longUrl: 'https://example.com',
      };

      jest.spyOn(urlService, 'createShortUrl').mockRejectedValue(new Error('Creation failed'));

      await expect(service.createShortUrl(createRequest)).rejects.toThrow('Creation failed');
    });
  });

  describe('getUrl', () => {
    it('should get URL details', async () => {
      const getRequest: GetUrlRequest = {
        shortUrl: 'abc123',
      };

      jest.spyOn(urlService, 'getUrlByShortUrl').mockResolvedValue(mockUrl);

      const result = await service.getUrl(getRequest);

      expect(result).toEqual({
        shortUrl: mockUrl.shortUrl,
        longUrl: mockUrl.longUrl,
        createdAt: mockUrl.createdAt.toISOString(),
        expiresAt: undefined,
        clickCount: mockUrl.clickCount.toString(),
        isActive: mockUrl.isActive,
      });
    });

    it('should handle URL with click count', async () => {
      const getRequest: GetUrlRequest = {
        shortUrl: 'abc123',
      };

      const mockUrlWithClicks: UrlMapping = {
        ...mockUrl,
        clickCount: 42,
      };

      jest.spyOn(urlService, 'getUrlByShortUrl').mockResolvedValue(mockUrlWithClicks);

      const result = await service.getUrl(getRequest);

      expect(result.clickCount).toBe('42');
    });

    it('should handle URL with expiration date', async () => {
      const getRequest: GetUrlRequest = {
        shortUrl: 'abc123',
      };

      const expiresAt = new Date('2024-12-31');
      const mockUrlWithExpiry: UrlMapping = {
        ...mockUrl,
        expiresAt,
      };

      jest.spyOn(urlService, 'getUrlByShortUrl').mockResolvedValue(mockUrlWithExpiry);

      const result = await service.getUrl(getRequest);

      expect(result.expiresAt).toBe(expiresAt.toISOString());
    });

    it('should handle URL not found', async () => {
      const getRequest: GetUrlRequest = {
        shortUrl: 'nonexistent',
      };

      jest.spyOn(urlService, 'getUrlByShortUrl').mockRejectedValue(new Error('URL not found'));

      await expect(service.getUrl(getRequest)).rejects.toThrow('URL not found');
    });
  });

  describe('deactivateUrl', () => {
    it('should deactivate URL', async () => {
      const deactivateRequest = {
        shortUrl: 'abc123',
      };

      jest.spyOn(urlService, 'deactivateUrl').mockResolvedValue(undefined);

      const result = await service.deactivateUrl(deactivateRequest);

      expect(result).toEqual({ success: true });
      expect(urlService.deactivateUrl).toHaveBeenCalledWith(deactivateRequest.shortUrl);
    });

    it('should handle deactivation error', async () => {
      const deactivateRequest = {
        shortUrl: 'abc123',
      };

      jest.spyOn(urlService, 'deactivateUrl').mockRejectedValue(new Error('Deactivation failed'));

      await expect(service.deactivateUrl(deactivateRequest)).rejects.toThrow('Deactivation failed');
    });
  });
});