import '../utils/load-env.util.js';
import appConfig from '../../config.js';
import createApp from '../app.js';
import { dbMain as dataSource } from '../index.js';
import fs from 'node:fs';
import path from 'node:path';

function generateOpenapiDocument() {
  const dbMain = dataSource(appConfig);
  const { container } = createApp(appConfig, dbMain);
  const openApiDocument = container.openapiModule.service.generateDocument();
  const outputPath = path.resolve(process.cwd(), 'dist', 'openapi.json');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(openApiDocument), 'utf-8');

  console.log(`✅ ${outputPath}`);

  process.exit(0);
}

generateOpenapiDocument();
