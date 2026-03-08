/**
 * Adapter - Parc HTTP Repository Implementation
 * Implements IParcRepository using HTTP client
 */
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IParcRepository } from '../../domain/ports';
import { Parc } from '../../domain/entities';
import { HttpClientService, ApiResponse } from '../http/http-client.service';
import { ParcApiDto } from '../http/api-types';
import { Cacheable, CacheEvict } from '../../common/decorators/cacheable.decorator';

@Injectable()
export class ParcHttpRepository implements IParcRepository {
  constructor(
    private readonly httpClient: HttpClientService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cacheable('parcs')
  async findAll(): Promise<Parc[]> {
    this.logger.debug('Finding all parcs', {
      context: 'ParcHttpRepository',
    });
    const response = await this.httpClient.get<ApiResponse<ParcApiDto>>('/parcs');
    return response.data.map((p) => Parc.create(p));
  }

  @Cacheable('parcs')
  async findById(id: string): Promise<Parc> {
    this.logger.debug('Finding parc by id', {
      context: 'ParcHttpRepository',
      parcId: id,
    });
    const data = await this.httpClient.get<ParcApiDto>(`/parcs/${id}`);
    return Parc.create(data);
  }

  @CacheEvict('parcs')
  async create(parc: Omit<Parc, 'id'>): Promise<Parc> {
    this.logger.info('Creating parc', {
      context: 'ParcHttpRepository',
      name: parc.name,
    });
    const data = await this.httpClient.post<ParcApiDto>('/parcs', parc);
    return Parc.create(data);
  }

  @CacheEvict('parcs')
  async delete(id: string): Promise<void> {
    this.logger.info('Deleting parc', {
      context: 'ParcHttpRepository',
      parcId: id,
    });
    await this.httpClient.delete(`/parcs/${id}`);
  }
}
