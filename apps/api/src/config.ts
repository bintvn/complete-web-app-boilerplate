import { appConfig } from './core/app-config.js';

export default appConfig((config) => {
  return {
    appName: process.env.APP_NAME,
    server: {
      host: process.env.HOST,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    },
    cookie: {
      name: process.env.COOKIE_AUTH_NAME,
      secret: process.env.COOKIE_SECRET || config.cookie.secret,
      expiresInSeconds: process.env.COOKIE_EXPIRES_IN_SECOND
        ? parseInt(process.env.COOKIE_EXPIRES_IN_SECOND, 10)
        : undefined,
    },
    auth: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessExpiresInSeconds: process.env.JWT_ACCESS_EXPIRES_IN_SECOND
        ? parseInt(process.env.JWT_ACCESS_EXPIRES_IN_SECOND, 10)
        : undefined,
      refreshExpiresInSeconds: process.env.JWT_REFRESH_EXPIRES_IN_SECOND
        ? parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECOND, 10)
        : undefined,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      verification: {
        otpSecret: process.env.OTP_SECRET,
      },
    },
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      name: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT
        ? parseInt(process.env.SMTP_PORT, 10)
        : undefined,
      secure: process.env.SMTP_SECURE === 'true',
      fromEmail: process.env.SMTP_FROM_EMAIL,
      username: process.env.SMTP_LOGIN_EMAIL,
      password: process.env.SMTP_LOGIN_PASSWORD,
    },
  };
});
