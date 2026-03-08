/**
 * Get Parc By ID Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IParcRepository, PARC_REPOSITORY } from '../../../domain/ports';
import { Parc } from '../../../domain/entities';

@Injectable()
export class GetParcByIdUseCase {
  constructor(@Inject(PARC_REPOSITORY) private readonly parcRepository: IParcRepository) {}

  async execute(id: string): Promise<Parc> {
    return this.parcRepository.findById(id);
  }
}
