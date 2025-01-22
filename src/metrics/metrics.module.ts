import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

const metrics = [
  makeCounterProvider({
    name: 'url_shortener_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['status', 'method', 'path'],
  }),
  makeHistogramProvider({
    name: 'url_shortener_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['status', 'method', 'path'],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),
];

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [MetricsService, ...metrics],
  exports: [MetricsService],
})
export class MetricsModule {}