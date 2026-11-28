import 'server-only';
import { client } from '@complete-web-app-boilerplate/sdk/client.gen';

export async function getServerClient() {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error(
      "API_URL must be set to the API's absolute URL before building or running the web app."
    );
  }

  try {
    const url = new URL(baseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new Error();
  } catch {
    throw new Error('API_URL must be a valid absolute HTTP or HTTPS URL.');
  }

  client.setConfig({
    baseUrl,
  });

  return client;
}
