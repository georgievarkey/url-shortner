import { BadRequestException } from '@nestjs/common';

export class UrlExpiredException extends BadRequestException {
  constructor(shortUrl: string) {
    super(`URL with short code '${shortUrl}' has expired`);
  }
}
