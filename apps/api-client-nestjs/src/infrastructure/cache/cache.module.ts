import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheManagerStore } from 'cache-manager';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => {
        const keyv = new Keyv({
          store: new KeyvRedis({
            url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
          }),
          ttl: 60000, // Default TTL: 60 seconds
        });

        return {
          store: keyv as unknown as CacheManagerStore,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
