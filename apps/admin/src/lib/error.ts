export function normalizeApiError(error: unknown): {
  code?: string;
  message?: string;
} {
  return error instanceof Error ? { message: error.message } : {};
}
export function isRateLimitApiError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "RATE_LIMITED"
  );
}
