import { Prisma, UrlMapping } from '@prisma/client';

export const mockUrl: UrlMapping = {
  id: '1',
  shortUrl: 'abc123',
  longUrl: 'https://example.com',
  userId: null, // Make nullable to match your schema
  createdAt: new Date('2024-01-01'),
  expiresAt: null, // Make nullable to match your schema
  clickCount: 0,
  isActive: true,
};

export const mockPrismaService = {
  urlMapping: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  urlAnalytics: {
    create: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

export const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  quit: jest.fn(),
};

export const mockUrlService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  getOriginalUrl: jest.fn(),
  incrementClicks: jest.fn(),
  remove: jest.fn(),
  deactivateUrl: jest.fn(),
  createShortUrl: jest.fn(),
  getUrlByShortUrl: jest.fn(),
};