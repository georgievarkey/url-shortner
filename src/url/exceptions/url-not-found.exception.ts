import { NotFoundException } from '@nestjs/common';

export class UrlNotFoundException extends NotFoundException {
  constructor(shortUrl?: string) {
    super(`URL with short code '${shortUrl}' not found`);
  }
}
