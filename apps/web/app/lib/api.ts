import "server-only";
import { client } from "@complete-web-app-boilerplate/sdk/client.gen";

export async function getServerClient() {
  client.setConfig({
    baseUrl: process.env.API_URL,
  });

  return client;
}
