// src/utils/errors.ts

/**
 * Base API Error class with improved type handling
 */
export class APIError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    // Fix prototype chain
    Object.setPrototypeOf(this, APIError.prototype);
    this.name = "APIError";
  }
}

/**
 * Riot API specific error class
 */
export class RiotAPIError extends APIError {
  constructor(
    statusCode: number,
    message: string,
    public readonly riotErrorCode?: string
  ) {
    super(statusCode, message, "RIOT_API_ERROR");
    // Fix prototype chain
    Object.setPrototypeOf(this, RiotAPIError.prototype);
    this.name = "RiotAPIError";
  }
}

/**
 * Type-safe error codes mapping
 */
export const RIOT_ERROR_CODES: Record<number, string> = {
  400: "Bad request",
  401: "Unauthorized - Invalid API key",
  403: "Forbidden",
  404: "Data not found",
  429: "Rate limit exceeded",
  500: "Internal server error",
  503: "Service unavailable",
} as const;
