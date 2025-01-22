
# URL Shortener

A scalable URL shortening service built with NestJS, featuring gRPC, GraphQL, REST APIs, and comprehensive monitoring.

### Features

URL shortening with custom aliases\
Support for expiration dates\
Analytics tracking (clicks, referrers, browsers)\
Multiple API interfaces (REST, GraphQL, gRPC)\
Rate limiting\
Caching with Redis\
Metrics and monitoring\
Kubernetes deployment ready\
Comprehensive test coverage

###  Prerequisites

Node.js (>= 16.0.0)\
Docker\
Docker Compose\
Kubernetes (optional)\
Redis\
PostgreSQL

## Quick Start

###  Clone repository
```
git clone https://github.com/yourusername/url-shortener.git
```
### Install dependencies
```
npm install
```
### Start required services
```
docker-compose up -d
```

### Run migrations
```
npx prisma migrate dev
```

### Start application
```
npm run start:dev
```
## Access services:

REST API: http://localhost:3000\
GraphQL Playground: http://localhost:3000/graphql\
Swagger Documentation: http://localhost:3000/api\
Prometheus: http://localhost:9090\
Grafana: http://localhost:8080 (admin/admin)\

## Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/urlshortener?schema=public"

## Redis
REDIS_URL="redis://localhost:6379"

###  Rate Limiting
RATE_LIMIT_TTL=60\
RATE_LIMIT_MAX=100

## Directory Structure

```bash
url-shortener/
├── docs/                  # Documentation
├── src/
│   ├── analytics/        # Analytics service
│   │   ├── services/
│   │   ├── controllers/
│   │   └── dto/
│   ├── common/          # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── middleware/
│   ├── grpc/            # gRPC service
│   │   ├── interfaces/
│   │   └── services/
│   ├── health/          # Health checks
│   │   └── indicators/
│   ├── metrics/         # Metrics service
│   │   └── definitions/
│   ├── prisma/          # Prisma service
│   ├── proto/           # Protocol buffers
│   ├── redis/           # Redis service
│   └── url/             # URL service
│       ├── controllers/
│       ├── dto/
│       ├── entities/
│       ├── resolvers/
│       └── services/
├── test/                # Test files
│   ├── e2e/
│   └── unit/
├── kubernetes/          # K8s configurations
│   ├── base/
│   └── overlays/
├── prometheus/          # Prometheus config
└── grafana/            # Grafana dashboards
    └── provisioning/
```

## Features

### Core Features
⚡ High-performance URL shortening\
🔄 Multiple API interfaces (REST, GraphQL, gRPC)\
📊 Real-time analytics and tracking\
🚀 Horizontal scaling support\
🔒 Rate limiting and security features

### Technical Features
📦 NestJS framework with TypeScript\
💾 PostgreSQL with Prisma ORM\
🔄 Redis caching\
📡 gRPC support\
🎯 GraphQL API\
📊 Prometheus metrics\
📈 Grafana dashboards\
🚢 Kubernetes deployment\
🧪 Comprehensive testing

## Tech Stack

### Backend
Node.js (v16+)\
NestJS\
TypeScript\
PostgreSQL\
Redis\
Prisma ORM

### APIs
REST (Express)\
GraphQL (Apollo)\
gRPC

## Monitoring & Metrics

Prometheus\
Grafana\
ELK Stack (optional)\

## Infrastructure

Docker\
Kubernetes\
Helm

## System Requirements
### Development

Node.js 16.0.0+\
npm 7.0.0+\
Docker & Docker Compose\
4GB RAM minimum\
PostgreSQL 14+\
Redis 7+

## Production (Minimum)

2 vCPUs\
4GB RAM\
20GB Storage\
PostgreSQL 14+\
Redis 7+\
Kubernetes 1.24+

## Architecture & Design

### High Level Architecture

![alt text](image.png)

### Component & Instructions

![alt text](image-1.png)

### Entity Relationship Diagram

![alt text](image-2.png)
