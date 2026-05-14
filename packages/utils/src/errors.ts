/**
 * AppError hierarchy.
 *
 * Pattern from skill-fastify-api.md and SYSTEM_INSTRUCTIONS.md.
 * Every service throws a typed AppError subclass. The global Fastify error
 * handler maps these to HTTP status codes without leaking stack traces.
 *
 * Never throw raw `Error` from business logic — type the failure mode.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly meta: Record<string, unknown>;
  // Set true if the message is safe to expose to the client as-is.
  public readonly exposable: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    meta: Record<string, unknown> = {},
    exposable = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.meta = meta;
    this.exposable = exposable;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /** Serialize for API responses — never includes stack. */
  public toJSON(): {
    error: string;
    code: string;
    statusCode: number;
    meta?: Record<string, unknown>;
  } {
    return {
      error: this.exposable ? this.message : 'An unexpected error occurred',
      code: this.code,
      statusCode: this.statusCode,
      ...(Object.keys(this.meta).length > 0 && { meta: this.meta }),
    };
  }
}

// ─────────────────────────────────────────────────────────────────────
// 4xx — Client errors
// ─────────────────────────────────────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', meta: Record<string, unknown> = {}) {
    super(message, 400, 'BAD_REQUEST', meta);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    meta: Record<string, unknown> = {},
  ) {
    super(message, 400, 'VALIDATION_ERROR', meta);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(entity = 'Resource') {
    super(`${entity} not found`, 404, 'NOT_FOUND', { entity });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', meta: Record<string, unknown> = {}) {
    super(message, 409, 'CONFLICT', meta);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds?: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMITED', {
      retryAfter: retryAfterSeconds,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// 5xx — Server errors
// ─────────────────────────────────────────────────────────────────────

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    // Never exposable — internal messages may leak implementation details.
    super(message, 500, 'INTERNAL_ERROR', {}, false);
  }
}

export class UpstreamError extends AppError {
  constructor(provider: string, detail?: string) {
    super(
      `Upstream service error: ${provider}${detail ? ` — ${detail}` : ''}`,
      502,
      'UPSTREAM_ERROR',
      { provider },
    );
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

// ─────────────────────────────────────────────────────────────────────
// Domain-specific
// ─────────────────────────────────────────────────────────────────────

export class CampaignAccessError extends ForbiddenError {
  constructor(campaignId: string) {
    super(`No access to campaign ${campaignId}`);
  }
}

export class HitlViolationError extends AppError {
  /**
   * Thrown if an agent tool tries to execute a real-world action without
   * an approved AgentDraft. This is a guardrail of last resort — the
   * primary HITL contract is enforced at the route layer.
   */
  constructor(actionType: string) {
    super(
      `HITL violation: action "${actionType}" attempted without approved draft`,
      500,
      'HITL_VIOLATION',
      { actionType },
      false,
    );
  }
}

/**
 * Type guard — useful in catch blocks to narrow `unknown`.
 */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
