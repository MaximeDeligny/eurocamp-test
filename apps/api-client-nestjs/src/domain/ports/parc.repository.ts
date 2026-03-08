/**
 * Port - Parc Repository Interface
 * Defines contract for parc data access without implementation details
 */
import { Parc } from '../entities';

export interface IParcRepository {
  findAll(): Promise<Parc[]>;
  findById(id: string): Promise<Parc>;
  create(parc: Omit<Parc, 'id'>): Promise<Parc>;
  delete(id: string): Promise<void>;
}

export const PARC_REPOSITORY = Symbol('PARC_REPOSITORY');
