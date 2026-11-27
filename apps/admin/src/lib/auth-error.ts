export class AuthApiError extends Error {
  code?: string;
  constructor(error: unknown) {
    const value =
      error && typeof error === "object"
        ? (error as {
            message?: string;
            code?: string;
            errors?: Array<string | { message?: string }>;
          })
        : {};
    super(
      value.message ||
        value.errors
          ?.map((issue) => (typeof issue === "string" ? issue : issue.message))
          .filter(Boolean)
          .join(", ") ||
        "Permintaan gagal. Silakan coba lagi.",
    );
    this.code = value.code;
  }
}
