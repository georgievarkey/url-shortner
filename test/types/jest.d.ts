import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}

export type MockRedisClient = {
  [K in keyof Redis]: jest.Mock;
};

export type MockPrismaClient = {
  [K in keyof PrismaClient]: jest.Mock;
};