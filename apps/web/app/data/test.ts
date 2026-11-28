import 'server-only';

import { listTests } from '@complete-web-app-boilerplate/sdk';
import { cacheLife, cacheTag } from 'next/cache';
import { getServerClient } from '../lib/api';

export async function getTests() {
  'use cache';
  cacheLife('max');
  cacheTag('posts');

  const { data, error } = await listTests({
    client: await getServerClient(),
  });

  if (!data && error) {
    throw error;
  }

  return data;
}
