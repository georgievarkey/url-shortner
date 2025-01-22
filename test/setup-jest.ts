/*

jest.mock('ioredis', () => {
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
    return jest.fn(() => mockRedisClient);
  });
  
*/
import { jest } from '@jest/globals';
import type { Redis as RedisType } from 'ioredis';

type MockRedisClient = {
  [K in keyof RedisType]: jest.Mock;
};

// Mock Redis client
const mockRedisClient: Partial<MockRedisClient> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  quit: jest.fn().mockImplementation(() => Promise.resolve()),
  on: jest.fn(),
};

// Mock IoRedis constructor
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

// Mock Prisma client
const mockPrisma = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
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
};

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

export { mockRedisClient, mockPrisma };