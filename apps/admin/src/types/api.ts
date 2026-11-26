import type { SessionDTO } from "./dtos";

export type ApiRequestClientConfig = {
  userAgent?: string;
  apiBaseUrl?: string;
};

export type ApiRequestOptions = RequestInit & {
  accessToken?: string | null;
  skipTokenRefresh?: boolean;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ListMeta = {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
};

export type ApiSuccessList<T> = {
  success: true;
  data: T;
  meta: ListMeta;
};

export type TokenResponse = {
  accessToken: string;
  accessTokenExpiresIn: number;
  accessTokenExpiresAt: number;
};

export type JwtPayload = {
  exp?: number;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  message?: string;
  retryIn?: number;
  retryAt?: number;
};

export type SessionBootstrapResponse =
  | ApiSuccess<SessionDTO & { token: TokenResponse }>
  | ApiErrorResponse;

export type SortDirection = "ASC" | "DESC";

export type ListQueryParams = {
  query?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
};
