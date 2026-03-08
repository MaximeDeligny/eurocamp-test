# Eurocamp API Client (NestJS)

A NestJS-based API client service that consumes the Eurocamp API.

## Prerequisites

- Redis server running on localhost:6379 (or configure via environment variables)
- Eurocamp API running on http://localhost:3001

## Installation

```bash
cd apps/api-client-nestjs
npm install
```

## Environment Variables

Create a `.env` file:

```env
# API Configuration
API_BASE_URL=http://localhost:3001/api/1
PORT=3002

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Service

### Start the NestJS Service

```bash
npm run start:dev
```

The service will be available at:
- **API endpoints**: `http://localhost:3002`
- **Swagger documentation**: `http://localhost:3002/api`
