/**
 * HTTP Client Service - Low-level HTTP operations with retry logic
 * Infrastructure concern - handles network communication
 */
import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export interface FetchError extends Error {
  status?: number;
}

export interface ApiResponse<T> {
  data: T[];
}

@Injectable()
export class HttpClientService {
  private readonly maxRetryTime: number; // Maximum retry time in milliseconds
  private readonly retryDelay: number; // Initial retry delay
  private readonly timeout: number; // Timeout per request
  private readonly baseURL: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:3001/api/1';
    this.maxRetryTime = parseInt(process.env.MAX_RETRY_TIME || '60000', 10);
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT || '10000', 10);
    this.retryDelay = parseInt(process.env.RETRY_DELAY || '1000', 10);

    this.logger.info('HTTP Client initialized', {
      context: 'HttpClientService',
      baseURL: this.baseURL,
      maxRetryTime: `${this.maxRetryTime}ms`,
      requestTimeout: `${this.timeout}ms`,
      retryDelay: `${this.retryDelay}ms`,
    });
  }

  /**
   * Fetch with timeout using AbortController
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: FetchError = new Error(`Request timeout after ${this.timeout}ms`);
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      throw error;
    }
  }

  /**
   * Handle response and parse JSON
   */
  private async handleResponse<T>(response: Response, operationName: string): Promise<T> {
    if (!response.ok) {
      const error: FetchError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      // Error will be logged by ExceptionFilter with correlationId
      throw error;
    }

    // Handle 204 No Content or empty responses
    if (response.status === HttpStatus.NO_CONTENT || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined as T;
    }

    return JSON.parse(text);
  }

  /**
   * Retry logic with time-based retry limit and exponential backoff
   */
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
        throw error;
      }

      // Calculate next delay with exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      const timeAfterDelay = elapsedTime + delay;

      // Retry on server errors (5xx) or network errors if within time limit
      if (timeAfterDelay < this.maxRetryTime) {
        // Log retry attempts (useful for monitoring network issues)
        this.logger.warn('Retrying request to external API', {
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
      this.logger.error('Max retry time exceeded for external API request', {
        context: 'HttpClientService',
        operation: operationName,
        totalAttempts: attempt,
        totalTime: `${elapsedTime}ms`,
        maxRetryTime: `${this.maxRetryTime}ms`,
      });

      // Final error will be logged by ExceptionFilter
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generic GET request
   */
  async get<T>(path: string): Promise<T> {
    this.logger.debug('Sending GET request to external API', {
      context: 'HttpClientService',
      operation: 'GET',
      url: `${this.baseURL}${path}`,
      path,
    });

    return this.retryRequest(
      async () => {
        const response = await this.fetchWithTimeout(`${this.baseURL}${path}`);
        const data = await this.handleResponse<T>(response, `GET ${path}`);

        this.logger.debug('Received response from external API', {
          context: 'HttpClientService',
          operation: 'GET',
          url: `${this.baseURL}${path}`,
          path,
          status: response.status,
          responseData: data,
        });

        return data;
      },
      `GET ${path}`,
    );
  }

  /**
   * Generic POST request
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    this.logger.debug('Sending POST request to external API', {
      context: 'HttpClientService',
      operation: 'POST',
      url: `${this.baseURL}${path}`,
      path,
      requestBody: body,
    });

    return this.retryRequest(
      async () => {
        const response = await this.fetchWithTimeout(`${this.baseURL}${path}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        const data = await this.handleResponse<T>(response, `POST ${path}`);

        this.logger.debug('Received response from external API', {
          context: 'HttpClientService',
          operation: 'POST',
          url: `${this.baseURL}${path}`,
          path,
          status: response.status,
          responseData: data,
        });

        return data;
      },
      `POST ${path}`,
    );
  }

  /**
   * Generic DELETE request
   */
  async delete(path: string): Promise<void> {
    this.logger.debug('Sending DELETE request to external API', {
      context: 'HttpClientService',
      operation: 'DELETE',
      url: `${this.baseURL}${path}`,
      path,
    });

    return this.retryRequest(
      async () => {
        const response = await this.fetchWithTimeout(`${this.baseURL}${path}`, {
          method: 'DELETE',
        });
        const data = await this.handleResponse<void>(response, `DELETE ${path}`);

        this.logger.debug('Received response from external API', {
          context: 'HttpClientService',
          operation: 'DELETE',
          url: `${this.baseURL}${path}`,
          path,
          status: response.status,
        });

        return data;
      },
      `DELETE ${path}`,
    );
  }
}
