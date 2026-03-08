/**
 * Port - User Repository Interface
 * Defines contract for user data access without implementation details
 */
import { User } from '../entities';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  create(user: Omit<User, 'id'>): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
