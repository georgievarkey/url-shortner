import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { generateShortUrl } from '../utils/url.utils';

@Injectable()
export class UrlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(createUrlDto: CreateUrlDto) {
    const shortUrl = await generateShortUrl();
    
    const url = await this.prisma.urlMapping.create({
      data: {
        shortUrl,
        longUrl: createUrlDto.longUrl,
        expiresAt: createUrlDto.expiresAt,
      },
    });

    await this.redis.set(`url:${shortUrl}`, url.longUrl);
    return url;
  }

  async createShortUrl(createUrlDto: CreateUrlDto) {
    return this.create(createUrlDto);
  }

  async findAll() {
    return this.prisma.urlMapping.findMany();
  }

  async findOne(shortUrl: string) {
    const url = await this.prisma.urlMapping.findUnique({
      where: { shortUrl },
    });

    if (!url) {
      throw new NotFoundException(`URL with shortUrl ${shortUrl} not found`);
    }

    return url;
  }

  async getUrlByShortUrl(shortUrl: string) {
    return this.findOne(shortUrl);
  }

  async getOriginalUrl(shortUrl: string) {
    const cachedUrl = await this.redis.get(`url:${shortUrl}`);
    if (cachedUrl) {
      return cachedUrl;
    }

    const url = await this.findOne(shortUrl);
    await this.redis.set(`url:${shortUrl}`, url.longUrl);
    return url.longUrl;
  }

  async incrementClicks(shortUrl: string) {
    await this.prisma.urlMapping.update({
      where: { shortUrl },
      data: { clickCount: { increment: 1 } },
    });
  }

  async deactivateUrl(shortUrl: string) {
    await this.prisma.urlMapping.update({
      where: { shortUrl },
      data: { isActive: false },
    });
  }

  async remove(shortUrl: string) {
    await this.prisma.urlMapping.delete({
      where: { shortUrl },
    });
    await this.redis.del(`url:${shortUrl}`);
  }
}