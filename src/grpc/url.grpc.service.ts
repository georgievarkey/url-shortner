import { Injectable } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UrlService } from '../url/url.service';
import {
  CreateUrlRequest,
  GetUrlRequest,
  UrlResponse,
  DeactivateUrlRequest,
  DeactivateUrlResponse,
} from './interfaces/url.interface';

@Injectable()
export class UrlGrpcService {
  constructor(private readonly urlService: UrlService) {}

  @GrpcMethod('UrlShortener', 'CreateShortUrl')
  async createShortUrl(data: CreateUrlRequest): Promise<UrlResponse> {
    const url = await this.urlService.createShortUrl({
      longUrl: data.longUrl,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });

    return {
      shortUrl: url.shortUrl,
      longUrl: url.longUrl,
      createdAt: url.createdAt.toISOString(),
      expiresAt: url.expiresAt?.toISOString(),
      clickCount: url.clickCount.toString(),
      isActive: url.isActive,
    };
  }

  @GrpcMethod('UrlShortener', 'GetUrl')
  async getUrl(data: GetUrlRequest): Promise<UrlResponse> {
    const url = await this.urlService.getUrlByShortUrl(data.shortUrl);

    return {
      shortUrl: url.shortUrl,
      longUrl: url.longUrl,
      createdAt: url.createdAt.toISOString(),
      expiresAt: url.expiresAt?.toISOString(),
      clickCount: url.clickCount.toString(),
      isActive: url.isActive,
    };
  }

  @GrpcMethod('UrlShortener', 'DeactivateUrl')
  async deactivateUrl(
    data: DeactivateUrlRequest
  ): Promise<DeactivateUrlResponse> {
    await this.urlService.deactivateUrl(data.shortUrl);
    return { success: true };
  }
}