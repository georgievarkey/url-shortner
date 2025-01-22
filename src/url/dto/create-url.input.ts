import { InputType, Field } from '@nestjs/graphql';
import { IsUrl, IsOptional, IsDate } from 'class-validator';

@InputType()
export class CreateUrlInput {
  @Field()
  @IsUrl({
    require_tld: true,
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  longUrl: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}
