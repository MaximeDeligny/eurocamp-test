/**
 * Health Check Use Case - Business logic for checking service health
 */

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    eurocampApi: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthCheckUseCase {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async execute(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let apiStatus: 'up' | 'down' = 'down';
    let responseTime: number | undefined;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        process.env.API_BASE_URL || 'http://localhost:3001/api/1/users',
        {
          method: 'GET',
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      responseTime = Date.now() - startTime;

      if (response.ok) {
        apiStatus = 'up';
      } else {
        error = `HTTP ${response.status}`;
      }
    } catch (err) {
      if (err instanceof Error) {
        error = err.name === 'AbortError' ? 'Timeout' : err.message;
      } else {
        error = 'Unknown error';
      }
      this.logger.warn('Health check failed for Eurocamp API', {
        context: 'HealthCheckUseCase',
        error,
      });
    }

    return {
      status: apiStatus === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        eurocampApi: {
          status: apiStatus,
          ...(responseTime !== undefined && { responseTime }),
          ...(error && { error }),
        },
      },
    };
  }
}
