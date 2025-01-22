import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Res,
    HttpCode,
    HttpStatus,
    NotFoundException,
    ValidationPipe,
    UseGuards,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { UrlService } from './url.service';
  import { CreateUrlDto } from './dto/create-url.dto';
  import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  
  @ApiTags('urls')
  @Controller('urls')
  @UseGuards(RateLimiterGuard)
  export class UrlController {
    constructor(private readonly urlService: UrlService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a short URL' })
    @ApiResponse({ status: 201, description: 'URL successfully shortened.' })
    async create(@Body(ValidationPipe) createUrlDto: CreateUrlDto) {
      return this.urlService.create(createUrlDto);
    }
  
    @Get(':shortUrl')
    @ApiOperation({ summary: 'Get URL details' })
    @ApiResponse({ status: 200, description: 'URL details.' })
    @ApiResponse({ status: 404, description: 'URL not found.' })
    @ApiParam({ name: 'shortUrl', description: 'Short URL code' })
    async findOne(@Param('shortUrl') shortUrl: string) {
      const url = await this.urlService.findOne(shortUrl);
      if (!url) {
        throw new NotFoundException(`URL with code ${shortUrl} not found`);
      }
      return url;
    }
  
    @Get('redirect/:shortUrl')
    @ApiOperation({ summary: 'Redirect to original URL' })
    @ApiResponse({ status: 302, description: 'Redirect to original URL.' })
    @ApiResponse({ status: 404, description: 'URL not found.' })
    @ApiParam({ name: 'shortUrl', description: 'Short URL code' })
    async redirect(
      @Param('shortUrl') shortUrl: string,
      @Res() res: Response,
    ) {
      const url = await this.urlService.getOriginalUrl(shortUrl);
      if (!url) {
        throw new NotFoundException(`URL with code ${shortUrl} not found`);
      }
      await this.urlService.incrementClicks(shortUrl);
      return res.redirect(HttpStatus.FOUND, url);
    }
  
    @Delete(':shortUrl')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a URL' })
    @ApiResponse({ status: 204, description: 'URL successfully deleted.' })
    @ApiResponse({ status: 404, description: 'URL not found.' })
    @ApiParam({ name: 'shortUrl', description: 'Short URL code' })
    @ApiBearerAuth()
    async remove(@Param('shortUrl') shortUrl: string) {
      await this.urlService.remove(shortUrl);
    }
  }