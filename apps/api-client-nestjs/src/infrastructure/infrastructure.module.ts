/**
 * Infrastructure Module
 * Provides implementations for repositories and HTTP client
 */
import { Module } from '@nestjs/common';
import { HttpClientService } from './http/http-client.service';
import { UserHttpRepository } from './repositories/user-http.repository';
import { ParcHttpRepository } from './repositories/parc-http.repository';
import { BookingHttpRepository } from './repositories/booking-http.repository';
import { CacheModule } from './cache/cache.module';
import { USER_REPOSITORY, PARC_REPOSITORY, BOOKING_REPOSITORY } from '../domain/ports';

@Module({
  imports: [CacheModule],
  providers: [
    HttpClientService,
    // HTTP Repositories with automatic caching via decorators
    {
      provide: USER_REPOSITORY,
      useClass: UserHttpRepository,
    },
    {
      provide: PARC_REPOSITORY,
      useClass: ParcHttpRepository,
    },
    {
      provide: BOOKING_REPOSITORY,
      useClass: BookingHttpRepository,
    },
  ],
  exports: [USER_REPOSITORY, PARC_REPOSITORY, BOOKING_REPOSITORY],
})
export class InfrastructureModule {}
