/**
 * Delete Parc Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IParcRepository, PARC_REPOSITORY } from '../../../domain/ports';

@Injectable()
export class DeleteParcUseCase {
  constructor(@Inject(PARC_REPOSITORY) private readonly parcRepository: IParcRepository) {}

  async execute(id: string): Promise<void> {
    return this.parcRepository.delete(id);
  }
}
