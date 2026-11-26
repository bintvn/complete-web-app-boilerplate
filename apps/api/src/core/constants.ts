export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const HOST = process.env.HOST || 'localhost';
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export const REDIRECT_TRAILING_SLASH =
  process.env.REDIRECT_TRAILING_SLASH === 'true';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
