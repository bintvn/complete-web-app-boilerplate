import { DataSource } from 'typeorm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppConfig } from './types/app.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbMain = (config: AppConfig) => {
  return new DataSource({
    type: 'mysql',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: [
      path.join(__dirname, 'modules', '**', '*.entity{.ts,.js}'),
      path.join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}'),
    ],
    logging: false,
    synchronize: false,
    timezone: 'Z',
  });
};

export { dbMain };
