import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { GatewayModule } from './gateway/gateway.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { winstonConfig } from './common/logger/winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    GatewayModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
