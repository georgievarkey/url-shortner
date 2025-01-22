import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IoRedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: IoRedis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.redisClient = new IoRedis(this.configService.get('REDIS_URL'));
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  getClient(): IoRedis {
    return this.redisClient;
  }
}