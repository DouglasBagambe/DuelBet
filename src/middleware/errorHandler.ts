// src/middleware/errorHandler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { APIError, RiotAPIError } from "../utils/errors";

/**
 * Type-safe error handler middleware
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error with type-safe properties
  console.error("Error:", {
    name: err instanceof Error ? err.name : "UnknownError",
    message: err instanceof Error ? err.message : String(err),
    stack:
      process.env.NODE_ENV === "development"
        ? err instanceof Error
          ? err.stack
          : undefined
        : undefined,
    timestamp: new Date().toISOString(),
  });

  // Handle RiotAPIError
  if (err instanceof RiotAPIError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      riotErrorCode: err.riotErrorCode,
      details: process.env.NODE_ENV === "development" ? err.details : undefined,
    });
    return;
  }

  // Handle APIError
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: process.env.NODE_ENV === "development" ? err.details : undefined,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : undefined,
  });
};
