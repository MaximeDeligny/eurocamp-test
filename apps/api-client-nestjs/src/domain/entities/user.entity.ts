/**
 * Domain Entity - User
 * Pure business object without framework dependencies
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
  ) {}

  static create(data: Omit<User, 'id'> & { id?: string }): User {
    return new User(data.id || '', data.name, data.email);
  }
}
