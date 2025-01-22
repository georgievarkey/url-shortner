import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Url } from './models/url.model';
import { CreateUrlInput } from './dto/create-url.input';
import { UrlService } from './url.service';

@Resolver(() => Url)
export class UrlResolver {
  constructor(private readonly urlService: UrlService) {}

  @Query(() => [Url])
  async urls(): Promise<Url[]> {
    const urls = await this.urlService.findAll();
    return urls.map(url => ({
      ...url,
      clickCount: url.clickCount || 0
    }));
  }

  @Query(() => Url, { nullable: true })
  async url(@Args('shortUrl') shortUrl: string): Promise<Url> {
    const url = await this.urlService.findOne(shortUrl);
    return {
      ...url,
      clickCount: url.clickCount || 0
    };
  }

  @Mutation(() => Url)
  async createUrl(
    @Args('input') createUrlInput: CreateUrlInput,
  ): Promise<Url> {
    const url = await this.urlService.create(createUrlInput);
    return {
      ...url,
      clickCount: url.clickCount || 0
    };
  }

  @Mutation(() => Boolean)
  async deleteUrl(@Args('shortUrl') shortUrl: string): Promise<boolean> {
    await this.urlService.remove(shortUrl);
    return true;
  }

  @Query(() => String)
  async resolveUrl(@Args('shortUrl') shortUrl: string): Promise<string> {
    const url = await this.urlService.getOriginalUrl(shortUrl);
    await this.urlService.incrementClicks(shortUrl);
    return url;
  }
}