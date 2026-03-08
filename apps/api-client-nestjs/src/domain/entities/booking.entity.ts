/**
 * Domain Entity - Booking
 * Pure business object without framework dependencies
 */
export class Booking {
  constructor(
    public readonly id: string,
    public readonly user: string,
    public readonly parc: string,
    public readonly bookingdate: string,
  ) {}

  static create(data: Omit<Booking, 'id'> & { id?: string }): Booking {
    return new Booking(
      data.id || '',
      data.user,
      data.parc,
      data.bookingdate,
    );
  }
}
