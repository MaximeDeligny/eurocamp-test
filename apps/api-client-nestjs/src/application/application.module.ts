/**
 * Application Module
 * Provides use cases (business logic layer)
 */
import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import {
  GetAllUsersUseCase,
  GetUserByIdUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
} from './use-cases/user';
import {
  GetAllParcsUseCase,
  GetParcByIdUseCase,
  CreateParcUseCase,
  DeleteParcUseCase,
} from './use-cases/parc';
import {
  GetAllBookingsUseCase,
  GetBookingByIdUseCase,
  CreateBookingUseCase,
  DeleteBookingUseCase,
} from './use-cases/booking';
import { HealthCheckUseCase } from './use-cases/health';

@Module({
  imports: [InfrastructureModule],
  providers: [
    // User use cases
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    DeleteUserUseCase,
    // Parc use cases
    GetAllParcsUseCase,
    GetParcByIdUseCase,
    CreateParcUseCase,
    DeleteParcUseCase,
    // Booking use cases
    GetAllBookingsUseCase,
    GetBookingByIdUseCase,
    CreateBookingUseCase,
    DeleteBookingUseCase,
    // Health use case
    HealthCheckUseCase,
  ],
  exports: [
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    DeleteUserUseCase,
    GetAllParcsUseCase,
    GetParcByIdUseCase,
    CreateParcUseCase,
    DeleteParcUseCase,
    GetAllBookingsUseCase,
    GetBookingByIdUseCase,
    CreateBookingUseCase,
    DeleteBookingUseCase,
    HealthCheckUseCase,
  ],
})
export class ApplicationModule {}
