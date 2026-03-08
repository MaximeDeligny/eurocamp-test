import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    const correlationId = request['correlationId'];
    const start = Date.now();

    // Log request details in debug mode
    this.logger.debug('Incoming HTTP Request', {
      context: 'HTTP',
      correlationId,
      method,
      url,
      body,
      query,
      params,
      headers: {
        'user-agent': headers['user-agent'],
        'content-type': headers['content-type'],
        accept: headers['accept'],
      },
    });

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - start;

        // Info level - basic request info
        this.logger.info('HTTP Request', {
          context: 'HTTP',
          correlationId,
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
        });

        // Debug level - include response body
        this.logger.debug('HTTP Response', {
          context: 'HTTP',
          correlationId,
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          responseBody: data,
        });
      }),
    );
  }
}
