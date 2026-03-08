import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request as any)['correlationId'];

    // Determine status code
    let status: number;
    let message: any;

    if (exception instanceof HttpException) {
      // NestJS HttpException
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error && 'status' in exception) {
      // Custom Error with status property (from HttpClientService)
      status = (exception as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = { message: exception.message };
    } else {
      // Unknown error
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = { message: 'Internal server error' };
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      ...(typeof message === 'string' ? { message } : message),
    };

    // Log error with Winston
    this.logger.error('Unhandled Exception', {
      context: 'ExceptionFilter',
      correlationId,
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      ...errorResponse,
    });

    response.status(status).json(errorResponse);
  }
}
