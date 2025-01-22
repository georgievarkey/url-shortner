import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('url_shortener_requests_total')
    private readonly requestsCounter: Counter<string>,
    @InjectMetric('url_shortener_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  incrementRequestCount(status: number, method: string, path: string) {
    this.requestsCounter.inc({ status, method, path });
  }

  startTimer() {
    return this.requestDuration.startTimer();
  }
}