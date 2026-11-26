import type { DataSource } from 'typeorm';
import accessControlSeed from './access-control.seed.js';
import moduleSeed from './module.seed.js';
import roleSeed from './role.seed.js';

export default async function seeds(dbMain: DataSource) {
  await moduleSeed(dbMain);
  await roleSeed(dbMain);
  await accessControlSeed(dbMain);
}
