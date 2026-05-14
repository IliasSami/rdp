/**
 * Structured logger (Pino).
 *
 * NEVER use console.log/error in production code per SYSTEM_INSTRUCTIONS.md.
 * Every service imports this logger and emits structured JSON in prod,
 * pretty-printed lines in dev.
 *
 * Redaction list prevents OAuth tokens, passwords, and session cookies
 * from ever reaching log storage.
 */
import { pino, type Logger, type LoggerOptions } from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const baseConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  base: {
    service: process.env.SERVICE_NAME ?? 'rdp',
    env: process.env.NODE_ENV ?? 'development',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'headers.authorization',
      'headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.credentials',
      '*.refreshToken',
      '*.accessToken',
      '*.apiKey',
      '*.secret',
      'env.JWT_SECRET',
      'env.JWT_REFRESH_SECRET',
      'env.ENCRYPTION_KEY',
      'env.COOKIE_SECRET',
      'env.ANTHROPIC_API_KEY',
      'env.DATAFORSEO_PASSWORD',
      'env.R2_SECRET_ACCESS_KEY',
      'env.RESEND_API_KEY',
      'env.OPENAI_API_KEY',
      'env.GOOGLE_CLIENT_SECRET',
      'env.META_APP_SECRET',
      'env.LINKEDIN_CLIENT_SECRET',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

const devTransport: LoggerOptions['transport'] = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:HH:MM:ss.l',
    ignore: 'pid,hostname,service,env',
    singleLine: false,
  },
};

export const logger: Logger = pino({
  ...baseConfig,
  ...(isProd ? {} : { transport: devTransport }),
});

/**
 * Returns a child logger pre-bound with the given context fields.
 * Use for per-request, per-job, per-campaign scoping.
 */
export function createChildLogger(
  bindings: Record<string, unknown>,
): Logger {
  return logger.child(bindings);
}

export type { Logger };
