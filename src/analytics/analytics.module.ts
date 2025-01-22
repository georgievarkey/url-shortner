import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}