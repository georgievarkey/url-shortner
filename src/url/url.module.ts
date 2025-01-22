import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlResolver } from './url.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [UrlController],
  providers: [UrlService, UrlResolver],
  exports: [UrlService],
})
export class UrlModule {}