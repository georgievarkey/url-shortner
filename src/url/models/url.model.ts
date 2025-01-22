import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Url {
  @Field(() => ID)
  id: string;

  @Field()
  shortUrl: string;

  @Field()
  longUrl: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field()
  clickCount: number;

  @Field()
  isActive: boolean;
}