import type { Module } from '../../types/module.types.js';
import createOpenapiRouter from './openapi.routes.js';
import OpenapiService from './openapi.service.js';
import packageJson from '../../../../package.json' with { type: 'json' };
import type { AppConfig } from '../../types/app.types.js';
import { registerOpenApiDocument } from './openapi.openapi.js';

export interface OpenapiModule extends Module {
  service: OpenapiService;
}

const createOpenapiModule = (appConfig: AppConfig): OpenapiModule => {
  const service = new OpenapiService({
    openapi: '3.1.1',
    info: { title: appConfig.appName, version: packageJson.version },
    servers: [{ url: '/' }],
  });
  const router = createOpenapiRouter(appConfig);
  registerOpenApiDocument(service);

  return {
    name: 'openapi',
    entities: [],
    service,
    router,
    routePath: 'docs',
  };
};

export default createOpenapiModule;
