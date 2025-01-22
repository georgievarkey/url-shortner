import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ClickEvent } from './interfaces/click-event.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async trackClick(shortUrl: string, event: ClickEvent): Promise<void> {
    const urlMapping = await this.prisma.urlMapping.findUnique({
      where: { shortUrl },
    });

    if (!urlMapping) {
      return;
    }

    // Store click event in database
    await this.prisma.urlAnalytics.create({
      data: {
        urlMappingId: urlMapping.id,
        referrer: event.referrer,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress,
      },
    });

    // Increment click count in Redis
    await this.redis.incr(`clicks:${shortUrl}`);
  }

  async getUrlStats(shortUrl: string) {
    const urlMapping = await this.prisma.urlMapping.findUnique({
      where: { shortUrl },
      include: {
        analytics: {
          orderBy: { clickedAt: 'desc' },
          take: 1000,
        },
      },
    });

    if (!urlMapping) {
      return null;
    }

    const clickCount = await this.redis.get(`clicks:${shortUrl}`) || '0';

    return {
      totalClicks: parseInt(clickCount),
      dailyClicks: this.calculateDailyClicks(urlMapping.analytics),
      topReferrers: this.calculateTopReferrers(urlMapping.analytics),
      browsers: this.calculateBrowserStats(urlMapping.analytics),
    };
  }

  private calculateDailyClicks(analytics: any[]) {
    const dailyClicks = {};
    analytics.forEach(click => {
      const date = click.clickedAt.toISOString().split('T')[0];
      dailyClicks[date] = (dailyClicks[date] || 0) + 1;
    });

    return Object.entries(dailyClicks).map(([date, count]) => ({
      date,
      count: Number(count),
    }));
  }

  private calculateTopReferrers(analytics: any[]) {
    const referrers = {};
    analytics.forEach(click => {
      if (click.referrer) {
        referrers[click.referrer] = (referrers[click.referrer] || 0) + 1;
      }
    });

    return Object.entries(referrers)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 10)
      .map(([referrer, count]) => ({
        referrer,
        count: Number(count),
      }));
  }

  private calculateBrowserStats(analytics: any[]) {
    const browsers = {};
    analytics.forEach(click => {
      if (click.userAgent) {
        const browser = this.detectBrowser(click.userAgent);
        browsers[browser] = (browsers[browser] || 0) + 1;
      }
    });

    return Object.entries(browsers).map(([browser, count]) => ({
      browser,
      count: Number(count),
    }));
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    return 'Other';
  }
}