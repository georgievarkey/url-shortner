import { IsUrl, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://example.com/very/long/url',
    description: 'The original URL to be shortened',
  })
  @IsUrl({
    require_tld: true,
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  longUrl: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Optional expiration date for the URL',
    required: false,
  })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}