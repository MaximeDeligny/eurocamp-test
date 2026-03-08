/**
 * Cacheable Decorator
 * Automatically caches method results
 */
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const CACHE_TTL = 60000; // 60 seconds

/**
 * Decorator to cache method results
 * @param keyPrefix - Prefix for cache key (e.g., 'users')
 */
export function Cacheable(keyPrefix: string) {
  const injectCache = Inject(CACHE_MANAGER);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Inject cache manager
    injectCache(target, 'cacheManager');

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager: Cache = this.cacheManager;
      const logger = this.logger; // Use existing logger from the class

      // Generate cache key
      let cacheKey: string;
      if (propertyKey === 'findAll') {
        cacheKey = `${keyPrefix}:all`;
      } else if (propertyKey === 'findById' && args.length > 0) {
        cacheKey = `${keyPrefix}:${args[0]}`;
      } else {
        cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;
      }

      // Try to get from cache
      const cached = await cacheManager.get(cacheKey);
      if (cached !== undefined && cached !== null) {
        logger?.info('Retrieved from cache', {
          context: target.constructor.name,
          method: propertyKey,
          cacheKey,
          fromCache: true,
        });
        return cached;
      }

      // Execute original method
      logger?.info('Cache miss - fetching from source', {
        context: target.constructor.name,
        method: propertyKey,
        cacheKey,
        fromCache: false,
      });

      const result = await originalMethod.apply(this, args);

      // Cache result
      if (result !== undefined && result !== null) {
        await cacheManager.set(cacheKey, result, CACHE_TTL);
        logger?.debug('Result cached for future requests', {
          context: target.constructor.name,
          method: propertyKey,
          cacheKey,
          ttl: `${CACHE_TTL}ms`,
        });
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Decorator to invalidate cache on method execution
 * @param keyPrefix - Prefix for cache key (e.g., 'users')
 */
export function CacheEvict(keyPrefix: string) {
  const injectCache = Inject(CACHE_MANAGER);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Inject cache manager
    injectCache(target, 'cacheManager');

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager: Cache = this.cacheManager;
      const logger = this.logger; // Use existing logger from the class

      // Invalidate all list cache
      const allKey = `${keyPrefix}:all`;
      await cacheManager.del(allKey);

      const keysInvalidated = [allKey];

      // If delete/update, also invalidate specific item
      if ((propertyKey === 'delete' || propertyKey === 'update') && args.length > 0) {
        const itemKey = `${keyPrefix}:${args[0]}`;
        await cacheManager.del(itemKey);
        keysInvalidated.push(itemKey);
      }

      logger?.info('Cache invalidated', {
        context: target.constructor.name,
        method: propertyKey,
        cacheKeys: keysInvalidated,
      });

      // Execute original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
