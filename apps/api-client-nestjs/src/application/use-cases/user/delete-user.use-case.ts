/**
 * Use Case - Delete User
 * Business logic for deleting a user
 */
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/ports';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
