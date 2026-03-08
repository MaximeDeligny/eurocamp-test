# Engineering Test - Notes

---

## Task 1: Database Structure Review & Improvements

### Current Database Structure

The `eurocamp_api` database consists of 3 main tables:

#### **1. Users Table**
- `id` (string/UUID) - Primary Key
- `name` (string)
- `email` (string)

#### **2. Parcs Table**
- `id` (string/UUID) - Primary Key
- `name` (string)
- `description` (string)

#### **3. Bookings Table**
- `id` (string/UUID) - Primary Key
- `user` (string/UUID) - References user ID
- `parc` (string/UUID) - References parc ID
- `bookingdate` (string)
- `comments` (string, optional)

### Issues Identified

1. **No Foreign Key Constraints**: The `bookings` table stores `user` and `parc` as plain strings without proper foreign key relationships
   - Risk of orphaned records (bookings referencing deleted users/parcs)
   - No referential integrity
   - Cannot enforce cascading deletes/updates

2. **Incorrect Data Types**:
   - `bookingdate` is stored as `string` instead of `DATE` or `TIMESTAMP`
   - Makes date-based queries inefficient and error-prone
   - Prevents proper date validation at database level

3. **Missing Indexes**:
   - No indexes on `bookings.user` and `bookings.parc` (foreign key columns)
   - Will cause slow queries when filtering/joining bookings by user or parc
   - No index on `bookingdate` for date range queries

4. **No Unique Constraints**:
   - `users.email` should be unique but isn't enforced at database level
   - Could lead to duplicate email addresses

5. **Missing Timestamps**:
   - No `created_at` or `updated_at` fields for audit trail
   - Cannot track when records were created or modified

6. **No Soft Deletes**:
   - Hard deletes could lose important historical data
   - Bookings history would be lost if user/parc is deleted

7. **Missing Validation Constraints**:
   - No NOT NULL constraints where appropriate
   - No CHECK constraints for data validation (e.g., email format, future booking dates)

### Proposed Improvements

#### **1. Add Foreign Key Relationships**

```sql
-- Add foreign key constraints to bookings table
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_user
  FOREIGN KEY (user) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_parc
  FOREIGN KEY (parc) REFERENCES parcs(id)
  ON DELETE CASCADE;
```

**TypeORM Implementation:**
```typescript
@Entity({ name: 'bookings' })
export class BookingModel {
  @PrimaryColumn()
  id!: string;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user' })
  user!: UserModel;

  @ManyToOne(() => ParcModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parc' })
  parc!: ParcModel;

  @Column({ type: 'timestamp' })
  bookingdate!: Date;

  @Column({ nullable: true })
  comments?: string;
}
```

#### **2. Fix Data Types**

```sql
-- Convert bookingdate from string to timestamp
ALTER TABLE bookings
  ALTER COLUMN bookingdate TYPE TIMESTAMP
  USING bookingdate::TIMESTAMP;
```

#### **3. Add Indexes**

```sql
-- Index for foreign keys (improves JOIN performance)
CREATE INDEX idx_bookings_user ON bookings(user);
CREATE INDEX idx_bookings_parc ON bookings(parc);

-- Index for date range queries
CREATE INDEX idx_bookings_date ON bookings(bookingdate);

-- Unique index for email
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

#### **4. Add Audit Timestamps**

```sql
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE parcs ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE parcs ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
```

**TypeORM Implementation:**
```typescript
@CreateDateColumn()
created_at!: Date;

@UpdateDateColumn()
updated_at!: Date;
```

#### **5. Add Soft Delete Support**

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE parcs ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN deleted_at TIMESTAMP NULL;
```

**TypeORM Implementation:**
```typescript
@DeleteDateColumn()
deleted_at?: Date;
```

#### **6. Add Validation Constraints**

```sql
-- Ensure required fields are not null
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

ALTER TABLE parcs ALTER COLUMN name SET NOT NULL;
ALTER TABLE parcs ALTER COLUMN description SET NOT NULL;

-- Email validation (PostgreSQL)
ALTER TABLE users ADD CONSTRAINT chk_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```
---

## Task 2: Latest Backend Development Practices

### 1. **Architecture & Design Patterns**

#### **Clean Architecture / Hexagonal Architecture**
- Separate business logic from infrastructure concerns
- Use dependency injection for loose coupling
- Repository pattern for data access abstraction
- Use cases/services for business logic
- DTOs for data transfer and validation

### 2. **TypeScript Best Practices**

#### **Strict Type Safety**
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

#### **Use Type Guards & Discriminated Unions**
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

#### **Avoid `any`, use `unknown` or Generics**
```typescript
// Bad
function process(data: any) { }

// Good
function process<T>(data: T) { }
```

### 3. **Error Handling & Resilience**

#### **Structured Logging with Winston**
```typescript
import winston from 'winston';
import { WinstonModule } from 'nest-winston';

// Configure Winston with multiple log levels
const logLevel = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error

export const winstonConfig: WinstonModuleOptions = {
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
      // Extract HTTP-specific fields
      const { method, url, statusCode, duration, correlationId } = metadata;

      // Build structured log line
      let mainInfo = message;
      if (method) {
        mainInfo = `${method} ${url} ${message}`;
      }
      if (statusCode) {
        mainInfo += ` - ${statusCode}`;
      }
      if (duration) {
        mainInfo += ` (${duration})`;
      }

      const contextStr = context ? `[${context}]` : '';
      const correlationStr = correlationId ? `[${correlationId}]` : '';

      // In debug mode, include full metadata
      let metadataStr = '';
      if (logLevel === 'debug' && Object.keys(metadata).length > 0) {
        metadataStr = `\n${JSON.stringify(metadata, null, 2)}`;
      }

      return `${timestamp} ${level} ${contextStr}${correlationStr} ${mainInfo}${metadataStr}`;
    }),
  ),
  transports: [new winston.transports.Console()],
};

// Usage in services
@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async findAll() {
    this.logger.info('Fetching all users', {
      context: 'UserService',
      operation: 'findAll'
    });

    this.logger.debug('Database query details', {
      context: 'UserService',
      query: 'SELECT * FROM users',
      params: []
    });
  }
}
```

**Log Levels:**
- `error` - Critical errors requiring immediate attention
- `warn` - Warning messages for potentially harmful situations
- `info` - General informational messages (production default)
- `debug` - Detailed debug information (shows full request/response details)

**Environment Configuration:**
```bash
# .env
LOG_LEVEL=info  # or debug, warn, error
```

#### **Time-Based Retry Logic**
```typescript
class HttpClientService {
  private readonly maxRetryTime = 60000; // 60 seconds max
  private readonly retryDelay = 1000; // Initial delay

  private async retryRequest<T>(
    fn: () => Promise<T>,
    operationName: string,
    startTime: number = Date.now(),
    attempt = 1,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const fetchError = error as FetchError;
      const status = fetchError.status;
      const elapsedTime = Date.now() - startTime;

      // Don't retry on client errors (4xx)
      if (status && status >= 400 && status < 500) {
        this.logger.warn('Client error - no retry', {
          context: 'HttpClientService',
          operation: operationName,
          status,
          attempt,
        });
        throw error;
      }

      // Calculate next delay with exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      const timeAfterDelay = elapsedTime + delay;

      // Retry if within time limit
      if (timeAfterDelay < this.maxRetryTime) {
        this.logger.warn('Retrying request', {
          context: 'HttpClientService',
          operation: operationName,
          attempt,
          elapsedTime: `${elapsedTime}ms`,
          maxRetryTime: `${this.maxRetryTime}ms`,
          nextDelay: `${delay}ms`,
          status,
        });

        await this.sleep(delay);
        return this.retryRequest(fn, operationName, startTime, attempt + 1);
      }

      // Max retry time exceeded
      this.logger.error('Max retry time exceeded', {
        context: 'HttpClientService',
        operation: operationName,
        totalAttempts: attempt,
        totalTime: `${elapsedTime}ms`,
        maxRetryTime: `${this.maxRetryTime}ms`,
      });

      throw error;
    }
  }
}
```

**Configuration:**
```bash
# .env
MAX_RETRY_TIME=60000  # Max total execution time (60s)
REQUEST_TIMEOUT=10000 # Timeout per request (10s)
RETRY_DELAY=1000      # Initial retry delay (1s)
```

**Benefits:**
- Time-based rather than attempt-based retries
- Exponential backoff (1s, 2s, 4s, 8s...)
- Continues retrying within time budget
- Structured logging at each step
- Only retries transient failures (5xx, network errors)

#### **Error Status Code Preservation**
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Determine correct status code
    let status: number;

    if (exception instanceof HttpException) {
      // NestJS HttpException
      status = exception.getStatus();
    } else if (exception instanceof Error && 'status' in exception) {
      // Custom Error with status property (from HTTP client)
      status = (exception as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      // Unknown error
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    this.logger.error('Unhandled Exception', {
      context: 'ExceptionFilter',
      correlationId,
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      statusCode: status,
    });

    response.status(status).json(errorResponse);
  }
}
```

**Result:** External API 404 errors return as 404 (not 500)

### 4. **API Design**

#### **RESTful Best Practices**
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Version your API (`/api/v1/...`)
- Use proper status codes (200, 201, 204, 400, 404, 500, etc.)
- Pagination for large collections

#### **Request Validation**
```typescript
import { IsEmail, IsNotEmpty, validate } from 'class-validator';

class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;
}
```

#### **Response Standardization**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { page: number; total: number };
}
```

### 5. **Testing Strategy**

#### **Test Pyramid**
- **Unit Tests**: 70% - Fast, isolated, test business logic
- **Integration Tests**: 20% - Test modules working together
- **E2E Tests**: 10% - Full application flow

#### **Testing Best Practices**
```typescript
// Use test builders/factories
const testUser = UserBuilder()
  .withEmail('test@example.com')
  .build();

// Mock external dependencies
jest.mock('./external-api');

// Test behavior, not implementation
describe('UserService', () => {
  it('should create user with hashed password', async () => {
    const result = await service.createUser({
      email: 'test@example.com',
      password: 'plain'
    });

    expect(result.password).not.toBe('plain');
    expect(result.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt
  });
});
```

### 6. **Security**

#### **Essential Security Practices**
- **Input Validation**: Sanitize all user inputs
- **Parameterized Queries**: Prevent SQL injection (use ORMs correctly)
- **Authentication**: JWT with short expiry + refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Prevent abuse
- **HTTPS Only**: Enforce TLS in production
- **CORS**: Configure properly
- **Secrets Management**: Use environment variables, never commit secrets (AWS Secrets Manager)

```typescript
// Rate limiting example
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

### 7. **Performance & Scalability**


#### **Caching Strategies with Decorators**

Instead of manual caching logic scattered throughout the codebase, use **decorator-based caching** for clean, maintainable code:

```typescript
// cacheable.decorator.ts
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const CACHE_TTL = 60000; // 60 seconds

/**
 * @Cacheable decorator - Automatically caches method results
 */
export function Cacheable(keyPrefix: string) {
  const injectCache = Inject(CACHE_MANAGER);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectCache(target, 'cacheManager');
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager: Cache = this.cacheManager;
      const logger = this.logger;

      // Generate cache key
      let cacheKey: string;
      if (propertyKey === 'findAll') {
        cacheKey = `${keyPrefix}:all`;
      } else if (propertyKey === 'findById' && args.length > 0) {
        cacheKey = `${keyPrefix}:${args[0]}`;
      }

      // Try cache first
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

      // Cache miss - fetch from source
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
      }

      return result;
    };
  };
}

/**
 * @CacheEvict decorator - Invalidates cache on write operations
 */
export function CacheEvict(keyPrefix: string) {
  const injectCache = Inject(CACHE_MANAGER);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    injectCache(target, 'cacheManager');
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheManager: Cache = this.cacheManager;
      const logger = this.logger;

      // Invalidate cache
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

      return originalMethod.apply(this, args);
    };
  };
}
```

**API Type Definitions:**
```typescript
// api-types.ts
export interface UserApiDto {
  id: string;
  name: string;
  email: string;
}

export interface ParcApiDto {
  id: string;
  name: string;
  description: string;
}

export interface BookingApiDto {
  id: string;
  user: string;
  parc: string;
  bookingdate: string;
}
```

**Usage in Repositories:**
```typescript
import { UserApiDto } from '../http/api-types';

@Injectable()
export class UserHttpRepository implements IUserRepository {
  constructor(
    private readonly httpClient: HttpClientService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cacheable('users')
  async findAll(): Promise<User[]> {
    const response = await this.httpClient.get<ApiResponse<UserApiDto>>('/users');
    return response.data.map((u) => User.create(u));
  }

  @Cacheable('users')
  async findById(id: string): Promise<User> {
    const data = await this.httpClient.get<UserApiDto>(`/users/${id}`);
    return User.create(data);
  }

  @CacheEvict('users')
  async create(user: Omit<User, 'id'>): Promise<User> {
    const data = await this.httpClient.post<UserApiDto>('/users', user);
    return User.create(data);
  }

  @CacheEvict('users')
  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/users/${id}`);
  }
}
```

**Benefits:**
- **Clean Code**: No manual cache logic in business methods
- **Automatic Invalidation**: Write operations automatically clear cache
- **Smart Key Generation**: `users:all` for lists, `users:123` for items
- **Observable**: Logs cache hits/misses at info level
- **Type-Safe**: Works with TypeScript decorators
- **Reusable**: Apply to any repository with `@Cacheable('resource')`

**Cache Behavior:**
```
GET /users      → Miss → Fetch → Cache as 'users:all'
GET /users      → Hit  → Return cached 'users:all'
POST /users     → Invalidate 'users:all'
DELETE /users/1 → Invalidate 'users:all' + 'users:1'
GET /users      → Miss → Fetch → Cache as 'users:all'
```

**Configuration:**
```typescript
// infrastructure.module.ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      store: 'memory',
      ttl: 60000, // 60 seconds
      max: 100,   // max items in cache
    }),
  ],
})
export class InfrastructureModule {}
```

#### **Database Optimization**
- Add proper indexes on frequently queried columns
- Use select only needed fields (avoid SELECT *)
- Implement pagination for large datasets
- Use database transactions for consistency
- Consider read replicas for scaling reads

#### **Async Processing**
```typescript
// Use queues for heavy tasks
import Bull from 'bull';

const emailQueue = new Bull('email-notifications');

emailQueue.process(async (job) => {
  await sendEmail(job.data.to, job.data.subject);
});

// Add job
await emailQueue.add({ to: 'user@example.com', subject: 'Welcome' });
```

### 8. **Observability**

#### **Structured Logging**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'api' },
  transports: [new winston.transports.Console()],
});

logger.info('User created', { userId: user.id, email: user.email });
```

#### **Monitoring & Metrics**
- Use APM tools (Kibana with Elastic, Better Stack, Datadog, Sentry)
- Track error rates, latency, throughput
- Set up alerts for critical failures
- Health check endpoints

#### **Distributed Tracing**
- Implement correlation IDs across services

### 9. **Code Quality**

#### **Linting & Formatting**
- ESLint with strict rules
- Prettier for consistent formatting
- Conventional commits

#### **Code Review Standards**
- Keep PRs small and focused
- Review for security vulnerabilities
- Check test coverage
- Ensure documentation is updated

## Task 3

### Frontend project
**apps/frontend-vue**

### Backend project
**apps/api-client-nestjs**
