import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { RedisService } from '../../redis/redis.service';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class RateLimiterGuard implements CanActivate {
    constructor(
      private readonly redisService: RedisService,
      private readonly configService: ConfigService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const ip = request.ip;
      const key = `ratelimit:${ip}`;
      
      const ttl = this.configService.get<number>('RATE_LIMIT_TTL', 60);
      const limit = this.configService.get<number>('RATE_LIMIT_MAX', 100);
  
      try {
        const currentCount = await this.redisService.incr(key);
        
        if (currentCount === 1) {
          await this.redisService.expire(key, ttl);
        }
  
        const ttlRemaining = await this.redisService.ttl(key);
  
        if (currentCount > limit) {
          throw new HttpException({
            status: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message: 'Rate limit exceeded',
            timeToReset: ttlRemaining,
          }, HttpStatus.TOO_MANY_REQUESTS);
        }
  
        return true;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        // Log error and allow request if Redis fails
        console.error('Rate limiter error:', error);
        return true;
      }
    }
  }