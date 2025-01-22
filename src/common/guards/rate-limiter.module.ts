import { Module } from '@nestjs/common';
import { RateLimiterGuard } from './rate-limiter.guard';
import { RedisModule } from '../../redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [RedisModule, ConfigModule],
  providers: [RateLimiterGuard],
  exports: [RateLimiterGuard],
})
export class RateLimiterModule {}