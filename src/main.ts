import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cors from 'cors';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(cors.default({
    origin: configService.get('CORS_ORIGINS', '*').split(','),
    credentials: true,
  }));
  app.use(compression.default());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('URL Shortener API')
      .setDescription('URL Shortener Service API Documentation')
      .setVersion('1.0')
      .addTag('urls')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Setup gRPC Microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'urlshortener',
      protoPath: join(__dirname, 'proto/url.proto'),
      url: `0.0.0.0:${configService.get('GRPC_PORT', 5000)}`,
    },
  });

  // Start microservices
  await app.startAllMicroservices();
  logger.log('gRPC microservice is running');

  // Start HTTP server
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Swagger documentation: ${await app.getUrl()}/api`);
    logger.log(`gRPC server is running on port: ${configService.get('GRPC_PORT', 5000)}`);
  }
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});