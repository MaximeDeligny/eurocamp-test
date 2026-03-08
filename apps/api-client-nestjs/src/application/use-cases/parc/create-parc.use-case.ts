/**
 * Create Parc Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IParcRepository, PARC_REPOSITORY } from '../../../domain/ports';
import { Parc } from '../../../domain/entities';

@Injectable()
export class CreateParcUseCase {
  constructor(@Inject(PARC_REPOSITORY) private readonly parcRepository: IParcRepository) {}

  async execute(parc: Omit<Parc, 'id'>): Promise<Parc> {
    return this.parcRepository.create(parc);
  }
}
