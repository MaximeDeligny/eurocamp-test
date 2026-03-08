/**
 * Gateway Module - Presentation layer
 * Exposes HTTP endpoints via controllers
 */
import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { ParcController } from './controllers/parc.controller';
import { BookingController } from './controllers/booking.controller';
import { HealthController } from './controllers/health.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [
    UserController,
    ParcController,
    BookingController,
    HealthController,
  ],
})
export class GatewayModule {}
