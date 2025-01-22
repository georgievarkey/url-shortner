import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const metricProviders = [
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
  makeCounterProvider({
    name: 'url_shortener_urls_created_total',
    help: 'Total number of URLs created',
  }),
  makeCounterProvider({
    name: 'url_shortener_url_clicks_total',
    help: 'Total number of URL clicks',
    labelNames: ['short_url'],
  }),
];