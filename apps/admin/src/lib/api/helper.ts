import type { ListQueryParams } from "../../types/api.ts";

export function resolveListPath(module: string, params?: ListQueryParams) {
  const searchParams = new URLSearchParams();

  if (typeof params?.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  if (typeof params?.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }

  if (params?.query) {
    searchParams.set("query", params.query);
  }

  if (params?.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params?.sortDirection) {
    searchParams.set("sortDirection", params.sortDirection);
  }

  const query = searchParams.toString();
  const path = query ? `/${module}?${query}` : `/${module}`;

  return path;
}
