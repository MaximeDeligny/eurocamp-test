/**
 * Use Case - Get User By ID
 * Business logic for retrieving a specific user
 */
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/ports';
import { User } from '../../../domain/entities';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
