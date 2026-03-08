/**
 * Health Controller - Gateway endpoint for health checks
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckUseCase, HealthCheckResult } from '../../application/use-cases/health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the API client service and its dependencies'
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckUseCase.execute();
  }
}
