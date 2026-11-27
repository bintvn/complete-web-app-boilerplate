import type { CorsOptions } from 'cors';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface AppConfig {
  appName: string;
  server: {
    /**
     * @type {string}
     * @default localhost
     */
    host: string;
    /**
     * @type {number}
     * @default 3000
     */
    port: number;
  };
  cors?: CorsOptions;
  cookie: {
    /**
     * @type {string}
     * @default auth_token
     */
    name: string;
    /**
     * @type {string}
     * @default secret
     */
    secret: string;
    /**
     * @type {number}
     * @default 604800 // 7 days
     */
    expiresInSeconds: number;
  };
  auth: {
    /**
     * @type {string}
     * @default secret
     */
    accessSecret: string;
    /**
     * @type {string}
     * @default secret
     */
    refreshSecret: string;
    /**
     * @type {number}
     * @default 3600
     */
    accessExpiresInSeconds: number;
    /**
     * @type {number}
     * @default 604800 // 7 days
     */
    refreshExpiresInSeconds: number;
    /**
     * @type {string}
     * @default api
     */
    issuer: string;
    /**
     * @type {string}
     * @default api
     */
    audience: string;
    verification: {
      /**
       * HMAC secret for verification codes.
       * @type {string | undefined}
       * @default undefined
       */
      otpSecret: string | undefined;
      /**
       * @type {number}
       * @default 10
       */
      codeTtlMinutes: number;
      /**
       * @type {number}
       * @default 5
       */
      maxFailedAttempts: number;
      /**
       * @type {number}
       * @default 60000
       */
      sendCooldownMs: number;
      /**
       * @type {number}
       * @default 3600000
       */
      sendWindowMs: number;
      /**
       * @type {number}
       * @default 5
       */
      maxSendsPerWindow: number;
    };
  };
  database: {
    /**
     * @type {string}
     * @default main
     */
    name: string;
    /**
     * @type {string}
     * @default localhost
     */
    host: string;
    /**
     * @type {number}
     * @default 3306
     */
    port: number;
    /**
     * @type {string}
     * @default root
     */
    username: string;
    /**
     * @type {string}
     * @default
     */
    password: string;
  };
  smtp: {
    /**
     * @type {string | undefined}
     * @default undefined
     */
    host: string | undefined;
    /**
     * @type {number | undefined}
     * @default undefined
     */
    port: number | undefined;
    /**
     * @type {boolean}
     * @default false
     */
    secure: boolean;
    /**
     * @type {string | undefined}
     * @default undefined
     */
    fromEmail: string | undefined;
    /**
     * @type {string | undefined}
     * @default undefined
     */
    username: string | undefined;
    /**
     * @type {string | undefined}
     * @default
     */
    password: string | undefined;
  };
}

export type ConfigCallback = (config: AppConfig) => DeepPartial<AppConfig>;
