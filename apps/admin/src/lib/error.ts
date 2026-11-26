import { APIError } from "./api/error";

type NormalizedApiError = {
  isApiError: boolean;
  code?: string;
  message: string;
  status?: number;
  retryIn?: number;
  retryAt?: number;
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof APIError) {
    const details = error.details as
      | { retryIn?: number; retryAt?: number }
      | undefined;
    return {
      isApiError: true,
      code: error.code,
      message: error.message || error.code,
      status: error.status,
      retryIn: details?.retryIn,
      retryAt: details?.retryAt,
    };
  }

  if (error instanceof Error) {
    return {
      isApiError: false,
      message: error.message || "Terjadi kesalahan",
    };
  }

  return {
    isApiError: false,
    message: "Terjadi kesalahan",
  };
}

export function isRateLimitApiError(error: unknown) {
  const normalizedError = normalizeApiError(error);

  return (
    normalizedError.code === "TOO_MANY_REQUESTS" ||
    normalizedError.status === 429
  );
}
