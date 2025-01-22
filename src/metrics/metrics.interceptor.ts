import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { MetricsService } from './metrics.service';
  
  @Injectable()
  export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const timer = this.metricsService.startTimer();
      const request = context.switchToHttp().getRequest();
      const { method, path } = request;
  
      return next.handle().pipe(
        tap({
          next: () => {
            const response = context.switchToHttp().getResponse();
            const status = response.statusCode;
            timer({ status: status.toString(), method, path });
            this.metricsService.incrementRequestCount(status, method, path);
          },
          error: (error) => {
            const status = error.status || 500;
            timer({ status: status.toString(), method, path });
            this.metricsService.incrementRequestCount(status, method, path);
          },
        }),
      );
    }
  }