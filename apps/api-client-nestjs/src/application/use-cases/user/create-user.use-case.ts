/**
 * Use Case - Create User
 * Business logic for creating a new user
 */
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/ports';
import { User } from '../../../domain/entities';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(user: Omit<User, 'id'>): Promise<User> {
    return this.userRepository.create(user);
  }
}
