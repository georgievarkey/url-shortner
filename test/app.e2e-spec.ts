import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

describe('URL Shortener (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    redisService = app.get<RedisService>(RedisService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean up database and cache before each test
    await prismaService.cleanDatabase();
    await redisService.getClient().flushall();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/urls (POST)', () => {
    it('should create a short URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/urls')
        .send({
          longUrl: 'https://example.com/very/long/url'
        })
        .expect(201);

      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.longUrl).toBe('https://example.com/very/long/url');
      expect(response.body.isActive).toBe(true);
    });

    it('should reject invalid URLs', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/urls')
        .send({
          longUrl: 'not-a-valid-url'
        })
        .expect(400);
    });
  });

  describe('/:shortUrl (GET)', () => {
    it('should redirect to long URL', async () => {
      // First create a short URL
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/urls')
        .send({
          longUrl: 'https://example.com'
        });

      const { shortUrl } = createResponse.body;

      // Then try to access it
      return request(app.getHttpServer())
        .get(`/${shortUrl}`)
        .expect(302)
        .expect('Location', 'https://example.com');
    });

    it('should return 404 for non-existent URLs', async () => {
      return request(app.getHttpServer())
        .get('/nonexistent')
        .expect(404);
    });
  });

  describe('/api/v1/urls/:shortUrl (GET)', () => {
    it('should return URL details', async () => {
      // First create a short URL
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/urls')
        .send({
          longUrl: 'https://example.com'
        });

      const { shortUrl } = createResponse.body;

      // Then get its details
      const response = await request(app.getHttpServer())
        .get(`/api/v1/urls/${shortUrl}`)
        .expect(200);

      expect(response.body).toHaveProperty('shortUrl', shortUrl);
      expect(response.body).toHaveProperty('longUrl', 'https://example.com');
      expect(response.body).toHaveProperty('clickCount');
      expect(response.body).toHaveProperty('createdAt');
    });
  });

  describe('GraphQL', () => {
    it('should create short URL through GraphQL', async () => {
      const createUrlMutation = `
        mutation {
          createShortUrl(input: {
            longUrl: "https://example.com/graphql"
          }) {
            shortUrl
            longUrl
            isActive
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUrlMutation
        })
        .expect(200);

      expect(response.body.data.createShortUrl).toHaveProperty('shortUrl');
      expect(response.body.data.createShortUrl.longUrl).toBe('https://example.com/graphql');
      expect(response.body.data.createShortUrl.isActive).toBe(true);
    });

    it('should query URL details through GraphQL', async () => {
      // First create a URL
      const createUrlMutation = `
        mutation {
          createShortUrl(input: {
            longUrl: "https://example.com/graphql"
          }) {
            shortUrl
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: createUrlMutation
        });

      const shortUrl = createResponse.body.data.createShortUrl.shortUrl;

      // Then query its details
      const getUrlQuery = `
        query {
          getUrl(shortUrl: "${shortUrl}") {
            shortUrl
            longUrl
            clickCount
            isActive
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: getUrlQuery
        })
        .expect(200);

      expect(response.body.data.getUrl).toHaveProperty('shortUrl', shortUrl);
      expect(response.body.data.getUrl.longUrl).toBe('https://example.com/graphql');
    });
  });
});
