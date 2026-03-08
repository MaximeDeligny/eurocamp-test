/**
 * Adapter - User HTTP Repository Implementation
 * Implements IUserRepository using HTTP client
 */
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IUserRepository } from '../../domain/ports';
import { User } from '../../domain/entities';
import { HttpClientService, ApiResponse } from '../http/http-client.service';
import { UserApiDto } from '../http/api-types';
import { Cacheable, CacheEvict } from '../../common/decorators/cacheable.decorator';

@Injectable()
export class UserHttpRepository implements IUserRepository {
  constructor(
    private readonly httpClient: HttpClientService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cacheable('users')
  async findAll(): Promise<User[]> {
    this.logger.debug('Finding all users', {
      context: 'UserHttpRepository',
    });
    const response = await this.httpClient.get<ApiResponse<UserApiDto>>('/users');
    return response.data.map((u) => User.create(u));
  }

  @Cacheable('users')
  async findById(id: string): Promise<User> {
    this.logger.debug('Finding user by id', {
      context: 'UserHttpRepository',
      userId: id,
    });
    const data = await this.httpClient.get<UserApiDto>(`/users/${id}`);
    return User.create(data);
  }

  @CacheEvict('users')
  async create(user: Omit<User, 'id'>): Promise<User> {
    this.logger.info('Creating user', {
      context: 'UserHttpRepository',
      email: user.email,
    });
    const data = await this.httpClient.post<UserApiDto>('/users', user);
    return User.create(data);
  }

  @CacheEvict('users')
  async delete(id: string): Promise<void> {
    this.logger.info('Deleting user', {
      context: 'UserHttpRepository',
      userId: id,
    });
    await this.httpClient.delete(`/users/${id}`);
  }
}
