import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redisService.getClient().ping();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}