/**
 * Domain Entity - Parc
 * Pure business object without framework dependencies
 */
export class Parc {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) {}

  static create(data: Omit<Parc, 'id'> & { id?: string }): Parc {
    return new Parc(data.id || '', data.name, data.description);
  }
}
