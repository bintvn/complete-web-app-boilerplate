import "server-only";

import { listPosts } from "@complete-web-app-boilerplate/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { getServerClient } from "../lib/api";

export async function getPosts() {
  "use cache";
  cacheLife("max");
  cacheTag("posts");

  const { data: result, error } = await listPosts({
    client: await getServerClient(),
  });

  if (!result && error) {
    throw error;
  }

  return result.data || [];
}
