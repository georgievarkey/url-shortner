import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const tables = await this.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

      for (const { tablename } of tables) {
        await this.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
        );
      }
    }
  }
}