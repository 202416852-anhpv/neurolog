export const ERROR_MESSAGES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  TODO_NOT_FOUND: "TODO_NOT_FOUND",
  INVALID_ID_FORMAT: "INVALID_ID_FORMAT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
