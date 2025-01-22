import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreateUrlDto } from '../dto/create-url.dto';

@Injectable()
export class UrlValidationPipe implements PipeTransform {
  private readonly maxUrlLength = 2048; // Common browser URL length limit
  private readonly allowedProtocols = ['http:', 'https:'];

  transform(value: CreateUrlDto) {
    if (!value.longUrl) {
      throw new BadRequestException('URL is required');
    }

    try {
      const url = new URL(value.longUrl);

      if (!this.allowedProtocols.includes(url.protocol)) {
        throw new BadRequestException('Invalid URL protocol');
      }

      if (value.longUrl.length > this.maxUrlLength) {
        throw new BadRequestException('URL is too long');
      }

      return value;
    } catch (error) {
      throw new BadRequestException('Invalid URL format');
    }
  }
}
