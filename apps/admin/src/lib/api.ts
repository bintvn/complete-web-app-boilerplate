import { DashboardApiRequestClient } from "./api/dashboard-api-request";

export const apiRequest = new DashboardApiRequestClient({
  apiBaseUrl: import.meta.env.VITE_API_URL,
});
