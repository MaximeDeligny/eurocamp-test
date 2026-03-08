/**
 * Get All Parcs Use Case
 */
import { Injectable, Inject } from '@nestjs/common';
import { IParcRepository, PARC_REPOSITORY } from '../../../domain/ports';
import { Parc } from '../../../domain/entities';

@Injectable()
export class GetAllParcsUseCase {
  constructor(@Inject(PARC_REPOSITORY) private readonly parcRepository: IParcRepository) {}

  async execute(): Promise<Parc[]> {
    return this.parcRepository.findAll();
  }
}
