import type {
  ConfigCallback,
  AppConfig,
  DeepPartial,
} from './types/app.types.js';

const defaultConfig: AppConfig = {
  server: {
    host: 'localhost',
    port: 3000,
  },
  cookie: {
    secret: 'secret',
    expiresInSeconds: 604800,
  },
  auth: {
    accessSecret: 'secret',
    refreshSecret: 'secret',
    accessExpiresInSeconds: 3600,
    refreshExpiresInSeconds: 604800,
    issuer: 'api',
    audience: 'api',
    otpSecret: undefined,
  },
  database: {
    host: 'localhost',
    port: 3306,
    name: 'main',
    username: 'root',
    password: '',
  },
  smtp: {
    host: undefined,
    port: undefined,
    secure: false,
    username: undefined,
    password: undefined,
    fromEmail: undefined,
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeRecords(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const output: Record<string, unknown> = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (sourceVal === undefined) continue;

    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      output[key] = mergeRecords(targetVal, sourceVal);
    } else {
      output[key] = sourceVal;
    }
  }

  return output;
}

function deepMerge<T extends object>(target: T, source?: DeepPartial<T>): T {
  if (!source || !isPlainObject(target) || !isPlainObject(source)) {
    return target;
  }

  return mergeRecords(target, source) as T;
}

export const appConfig = (configFn?: ConfigCallback): AppConfig => {
  const userConfig = configFn ? configFn(defaultConfig) : {};
  return deepMerge(defaultConfig, userConfig);
};
