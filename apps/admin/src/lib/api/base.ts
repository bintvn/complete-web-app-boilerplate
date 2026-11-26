import type { SignUpParams } from "@/types/auth.ts";
import type { SessionDTO, UserDTO } from "../../types/dtos/index.ts";
import type {
  ApiRequestClientConfig,
  ApiRequestOptions,
  ApiSuccess,
  JwtPayload,
  SessionBootstrapResponse,
  TokenResponse,
} from "../../types/api.ts";
import { APIError, type APIErrorCode } from "./error.ts";

export type AccessTokenListener = (token?: Readonly<TokenResponse>) => void;

const tokenRefreshBufferSeconds = 60;
const refreshTokenClearingErrorCodes = new Set([
  "BAD_REQUEST",
  "INVALID_TOKEN",
  "REFRESH_TOKEN_EXPIRED",
  "SESSION_DISABLED",
  "TOKEN_NOT_FOUND",
  "UNAUTHORIZED",
]);

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function parseJson(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export abstract class BaseApiRequestClient {
  private readonly apiBaseUrl: string;
  private readonly userAgent?: string;
  protected readonly origin: string;
  private inMemoryAccessToken: TokenResponse | null = null;
  private readonly accessTokenListeners = new Set<AccessTokenListener>();
  private static refreshAccessTokenPromise: Promise<TokenResponse> | null =
    null;

  constructor(config: ApiRequestClientConfig) {
    if (!config.apiBaseUrl) throw new Error("apiBaseUrl is required");

    this.userAgent = config.userAgent;
    this.apiBaseUrl = config.apiBaseUrl.replace(/\/$/, "");
    this.origin = this.resolveBrowserOrigin();
  }

  getInMemoryAccessToken() {
    return this.inMemoryAccessToken;
  }

  setInMemoryAccessToken(token: TokenResponse | null) {
    this.inMemoryAccessToken = token;
    const tokenSnapshot = token ? { ...token } : undefined;

    this.accessTokenListeners.forEach((listener) => listener(tokenSnapshot));
  }

  subscribeAccessToken(listener: AccessTokenListener): () => void {
    this.accessTokenListeners.add(listener);

    return () => {
      this.accessTokenListeners.delete(listener);
    };
  }

  async ensureFreshAccessToken(accessToken?: string | null) {
    const currentToken =
      this.inMemoryAccessToken ??
      (accessToken ? this.tokenFromAccessToken(accessToken) : null);

    if (!currentToken) return null;

    if (!this.inMemoryAccessToken) this.setInMemoryAccessToken(currentToken);

    if (!this.shouldRefreshAccessToken(currentToken))
      return currentToken.accessToken;

    if (!BaseApiRequestClient.refreshAccessTokenPromise) {
      BaseApiRequestClient.refreshAccessTokenPromise =
        this.refreshInMemoryAccessToken().finally(() => {
          BaseApiRequestClient.refreshAccessTokenPromise = null;
        });
    }

    const refreshedToken = await BaseApiRequestClient.refreshAccessTokenPromise;

    return refreshedToken.accessToken;
  }

  async request<T>(
    path: string,
    options: ApiRequestOptions = {},
    retryExpiredAccessToken = true,
  ): Promise<T> {
    try {
      const { accessToken, skipTokenRefresh, ...requestOptions } = options;
      const nextAccessToken =
        accessToken && !skipTokenRefresh
          ? await this.ensureFreshAccessToken(accessToken)
          : accessToken;
      const headers = new Headers(requestOptions.headers);

      if (this.userAgent) headers.set("user-agent", this.userAgent);

      if (this.origin) headers.set("origin", this.origin);

      if (requestOptions.body && !headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
      if (nextAccessToken)
        headers.set("Authorization", `Bearer ${nextAccessToken}`);

      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        ...requestOptions,
        headers,
        credentials: "include",
      });
      const payload = await parseJson(response);

      if (!response.ok) {
        const errorCode =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? (payload.error as APIErrorCode)
            : "UNKNOWN_CLIENT_ERROR";
        const message =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : "Request failed";

        if (
          errorCode === "ACCESS_TOKEN_EXPIRED" &&
          nextAccessToken &&
          !skipTokenRefresh &&
          retryExpiredAccessToken
        ) {
          const refreshedToken = await this.refreshInMemoryAccessToken();

          return this.request<T>(
            path,
            {
              ...options,
              accessToken: refreshedToken.accessToken,
            },
            false,
          );
        }

        if (
          errorCode === "TOKEN_REFRESH_TOO_EARLY" ||
          errorCode === "TOO_MANY_REQUESTS"
        ) {
          const retryIn =
            payload &&
            typeof payload === "object" &&
            "retryIn" in payload &&
            typeof payload.retryIn === "number"
              ? payload.retryIn
              : 0;
          const retryAt =
            payload &&
            typeof payload === "object" &&
            "retryAt" in payload &&
            typeof payload.retryAt === "number"
              ? payload.retryAt
              : 0;

          throw new APIError(errorCode, message, { retryIn, retryAt });
        }

        if (errorCode === "PROPERTY_LIMIT_REACHED") {
          const currentUsage =
            payload &&
            typeof payload === "object" &&
            "currentUsage" in payload &&
            typeof payload.currentUsage === "number"
              ? payload.currentUsage
              : 0;

          const feature =
            payload &&
            typeof payload === "object" &&
            "feature" in payload &&
            typeof payload.feature === "string"
              ? payload.feature
              : "unknown";

          const limit =
            payload &&
            typeof payload === "object" &&
            "limit" in payload &&
            typeof payload.limit === "number"
              ? payload.limit
              : 0;

          throw new APIError(errorCode, message, {
            feature,
            currentUsage,
            limit,
          });
        }

        if (errorCode === "FEATURE_NOT_AVAILABLE") {
          const feature =
            payload &&
            typeof payload === "object" &&
            "feature" in payload &&
            typeof payload.feature === "string"
              ? payload.feature
              : "unknown";

          throw new APIError(errorCode, message, { feature });
        }

        throw new APIError(errorCode, message);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof APIError) throw error;

      if (error instanceof TypeError) {
        throw new APIError(
          "INTERNAL_SERVER_ERROR",
          "Cannot connect to server. Please try again later.",
        );
      }

      console.error(error);

      throw new APIError("UNKNOWN_CLIENT_ERROR", "Unknown client error");
    }
  }

  protected async authenticatedRequest<T>(
    path: string,
    options: Omit<ApiRequestOptions, "accessToken"> = {},
  ) {
    const accessToken = await this.ensureFreshAccessToken();

    return this.request<T>(path, {
      ...options,
      accessToken,
    });
  }

  readonly auth = {
    signUp: (input: SignUpParams) => {
      return this.request<ApiSuccess<UserDTO>>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    signIn: (input: { email: string; password: string }) => {
      return this.request<ApiSuccess<TokenResponse>>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify({
          ...input,
        }),
      });
    },
    signOut: (accessToken?: string | null) => {
      return this.request<{ success: true }>("/auth/sign-out", {
        method: "POST",
        accessToken: accessToken ?? this.getInMemoryAccessToken()?.accessToken,
      });
    },
    session: (accessToken?: string | null) => {
      return this.request<ApiSuccess<SessionDTO>>("/auth/session", {
        method: "GET",
        accessToken: accessToken ?? this.getInMemoryAccessToken()?.accessToken,
      });
    },
    bootstrapSession: () => {
      return this.request<SessionBootstrapResponse>("/auth/session", {
        method: "GET",
        skipTokenRefresh: true,
      });
    },
    refreshToken: () => {
      return this.request<ApiSuccess<TokenResponse>>("/auth/refresh", {
        method: "POST",
        skipTokenRefresh: true,
      });
    },
    verifyEmail: (token: string) => {
      return this.request<{ success: true; message?: string }>(
        `/auth/verify/email?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
        },
      );
    },
    resendVerification: (email: string) => {
      return this.request<{ success: true }>(
        "/auth/email-verification/resend",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            callbackUrl: `${this.origin}/auth/email-verification`,
          }),
        },
      );
    },
    forgotPassword: (email: string) => {
      return this.request<{ success: true }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          callbackUrl: `${this.origin}/auth/reset-password`,
        }),
      });
    },
    checkResetPasswordToken: (token: string) => {
      return this.request<{ success: true }>("/auth/forgot-password/check", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    },
    resetPassword: (input: { token: string; password: string }) => {
      return this.request<{ success: true }>("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
  };

  private refreshAccessToken() {
    return this.auth.refreshToken();
  }

  private resolveBrowserOrigin() {
    if (typeof window === "undefined") return "";

    return window.location.origin;
  }

  private decodeJwtPayload(accessToken: string): JwtPayload | null {
    try {
      const payload = accessToken.split(".")[1];

      if (!payload) return null;

      const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
      const paddedPayload = normalizedPayload.padEnd(
        Math.ceil(normalizedPayload.length / 4) * 4,
        "=",
      );
      const decodedPayload = globalThis.atob(paddedPayload);

      return JSON.parse(decodedPayload) as JwtPayload;
    } catch {
      return null;
    }
  }

  private tokenFromAccessToken(accessToken: string): TokenResponse | null {
    const payload = this.decodeJwtPayload(accessToken);

    if (typeof payload?.exp !== "number") return null;

    return {
      accessToken,
      accessTokenExpiresAt: payload.exp,
      accessTokenExpiresIn: Math.max(payload.exp - nowInSeconds(), 0),
    };
  }

  private shouldRefreshAccessToken(token: TokenResponse) {
    return (
      token.accessTokenExpiresAt - nowInSeconds() <= tokenRefreshBufferSeconds
    );
  }

  private shouldClearInMemoryAccessToken(error: unknown) {
    return (
      error instanceof APIError &&
      refreshTokenClearingErrorCodes.has(error.code)
    );
  }

  private async refreshInMemoryAccessToken() {
    try {
      const response = await this.refreshAccessToken();

      this.setInMemoryAccessToken(response.data);

      return response.data;
    } catch (error) {
      if (this.shouldClearInMemoryAccessToken(error))
        this.setInMemoryAccessToken(null);

      throw error;
    }
  }
}
