import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { Request, Response } from 'express';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      const { method, url, ip } = request;
      const userAgent = request.get('user-agent') || '';
      const now = Date.now();
  
      return next.handle().pipe(
        tap(() => {
          const delay = Date.now() - now;
          const contentLength = response.get('content-length');
  
          this.logger.log(
            `${method} ${url} ${response.statusCode} ${contentLength}B ${delay}ms - ${ip} - ${userAgent}`
          );
        }),
      );
    }
  }