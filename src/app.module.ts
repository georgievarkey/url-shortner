// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';

import { UrlModule } from './url/url.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { GrpcModule } from './grpc/grpc.module';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: configService.get('NODE_ENV') !== 'production',
      introspection: configService.get('NODE_ENV') !== 'production',
      context: ({ req }) => ({ req }),
      formatError: (error) => ({
        message: error.message,
        path: error.path,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          stacktrace: 
            process.env.NODE_ENV === 'development' 
              ? error.extensions?.exception
              : undefined,
        },
      }),
    }),
  }),
  PrismaModule,
  RedisModule,
  UrlModule,
  AnalyticsModule,
  GrpcModule,
  HealthModule,
];

// Add MetricsModule only in production
if (process.env.NODE_ENV === 'production') {
  const { MetricsModule } = require('./metrics/metrics.module');
  imports.push(MetricsModule);
}

@Module({
  imports,
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}