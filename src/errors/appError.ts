import { ErrorCode } from "@/types/appError";

export class AppError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, options?: { cause?: unknown }) {
    super(code, options);
    this.name = "AppError";
    this.code = code;
  }
}

export function toErrorCode(error: unknown): ErrorCode {
  return error instanceof AppError ? error.code : ErrorCode.Unknown;
}
