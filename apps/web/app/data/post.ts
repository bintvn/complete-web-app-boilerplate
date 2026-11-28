import 'server-only';

import { listPosts } from '@complete-web-app-boilerplate/sdk';
import { cacheLife, cacheTag } from 'next/cache';
import { getServerClient } from '../lib/api';

export async function getPosts() {
  'use cache';
  cacheLife('max');
  cacheTag('posts');

  const client = await getServerClient();
  const { data, error, response } = await listPosts({ client });

  if (!data) {
    const detail = response ? `HTTP ${response.status}` : 'API request failed';

    throw new Error(
      `Could not load posts from API_URL (${detail}). Ensure the API is reachable during prerender.`,
      { cause: error }
    );
  }

  return data;
}
