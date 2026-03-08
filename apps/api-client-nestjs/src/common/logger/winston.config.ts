/**
 * Winston Logger Configuration
 */
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

// Get log level from environment variable, default to 'info'
// Supported levels: error, warn, info, http, verbose, debug, silly
const logLevel = process.env.LOG_LEVEL || 'info';

export const winstonConfig: WinstonModuleOptions = {
  level: logLevel,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, correlationId, stack, method, url, statusCode, duration, operation, ...metadata }) => {
          const contextStr = context ? `[${context}]` : '';
          const correlationStr = correlationId ? `[${correlationId}]` : '';
          const stackStr = stack ? `\n${stack}` : '';

          // Build main log line with key info
          let mainInfo = message;
          if (method || operation) {
            mainInfo = `${method || operation} ${url || ''} ${message}`;
          }
          if (statusCode) {
            mainInfo += ` - ${statusCode}`;
          }
          if (duration) {
            mainInfo += ` (${duration})`;
          }

          // In debug mode, include additional metadata
          let metadataStr = '';
          if (logLevel === 'debug' && Object.keys(metadata).length > 0) {
            metadataStr = `\n${JSON.stringify(metadata, null, 2)}`;
          }

          return `${timestamp} ${level} ${contextStr}${correlationStr} ${mainInfo}${stackStr}${metadataStr}`;
        }),
      ),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  ],
};
