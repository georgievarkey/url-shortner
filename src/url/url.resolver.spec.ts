import { Test, TestingModule } from '@nestjs/testing';
import { UrlResolver } from './url.resolver';
import { UrlService } from './url.service';
import { CreateUrlInput } from './dto/create-url.input';
import { UrlMapping } from '@prisma/client';

describe('UrlResolver', () => {
  let resolver: UrlResolver;
  let urlService: UrlService;

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
        UrlResolver,
        {
          provide: UrlService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            getOriginalUrl: jest.fn(),
            incrementClicks: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<UrlResolver>(UrlResolver);
    urlService = module.get<UrlService>(UrlService);
  });

  describe('urls', () => {
    it('should return array of URLs', async () => {
      const mockUrls: UrlMapping[] = [mockUrl];
      jest.spyOn(urlService, 'findAll').mockResolvedValue(mockUrls);

      const result = await resolver.urls();

      expect(result).toEqual(mockUrls.map(url => ({
        ...url,
        clickCount: url.clickCount || 0
      })));
    });
  });

  describe('url', () => {
    it('should return a single URL by shortUrl', async () => {
      jest.spyOn(urlService, 'findOne').mockResolvedValue(mockUrl);

      const result = await resolver.url('abc123');

      expect(result).toEqual({
        ...mockUrl,
        clickCount: mockUrl.clickCount || 0
      });
    });
  });

  describe('createUrl', () => {
    it('should create a new URL', async () => {
      const input: CreateUrlInput = {
        longUrl: 'https://example.com',
      };

      jest.spyOn(urlService, 'create').mockResolvedValue(mockUrl);

      const result = await resolver.createUrl(input);

      expect(result).toEqual({
        ...mockUrl,
        clickCount: mockUrl.clickCount || 0
      });
      expect(urlService.create).toHaveBeenCalledWith(input);
    });

    it('should create a URL with expiration date', async () => {
      const expiresAt = new Date();
      const input: CreateUrlInput = {
        longUrl: 'https://example.com',
        expiresAt,
      };

      const mockUrlWithExpiry: UrlMapping = {
        ...mockUrl,
        expiresAt,
      };

      jest.spyOn(urlService, 'create').mockResolvedValue(mockUrlWithExpiry);

      const result = await resolver.createUrl(input);

      expect(result).toEqual({
        ...mockUrlWithExpiry,
        clickCount: mockUrlWithExpiry.clickCount || 0
      });
      expect(urlService.create).toHaveBeenCalledWith(input);
    });
  });

  describe('deleteUrl', () => {
    it('should delete a URL and return true', async () => {
      jest.spyOn(urlService, 'remove').mockResolvedValue(undefined);

      const result = await resolver.deleteUrl('abc123');

      expect(result).toBe(true);
      expect(urlService.remove).toHaveBeenCalledWith('abc123');
    });
  });

  describe('resolveUrl', () => {
    it('should resolve and track URL click', async () => {
      const longUrl = 'https://example.com';
      jest.spyOn(urlService, 'getOriginalUrl').mockResolvedValue(longUrl);
      jest.spyOn(urlService, 'incrementClicks').mockResolvedValue(undefined);

      const result = await resolver.resolveUrl('abc123');

      expect(result).toBe(longUrl);
      expect(urlService.getOriginalUrl).toHaveBeenCalledWith('abc123');
      expect(urlService.incrementClicks).toHaveBeenCalledWith('abc123');
    });
  });
});