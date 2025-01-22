import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    PrismaModule,  // Add PrismaModule
    RedisModule,   // Add RedisModule
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}