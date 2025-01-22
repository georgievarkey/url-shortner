import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';
import { RateLimitExceededException } from '../exceptions/rate-limit-exceeded.exception';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const key = `ratelimit:${ip}`;
    const limit = 100; // requests
    const window = 60; // seconds

    const [current] = await Promise.all([
      this.redisService.incr(key),
      this.redisService.getClient().expire(key, window),
    ]);

    if (current > limit) {
      throw new RateLimitExceededException();
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

    next();
  }
}

