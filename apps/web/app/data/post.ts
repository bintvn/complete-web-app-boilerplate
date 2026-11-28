import 'server-only';

import { listPosts } from '@complete-web-app-boilerplate/sdk';
import { cacheLife, cacheTag } from 'next/cache';
import { getServerClient } from '../lib/api';

export async function getPosts() {
  'use cache';
  cacheLife('max');
  cacheTag('posts');

  const { data, error } = await listPosts({
    client: await getServerClient(),
  });

  if (!data && error) {
    throw error;
  }

  return data;
}
