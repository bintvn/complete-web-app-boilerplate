import type { Module } from '../../types/module.types.js';
import type OpenapiService from '../openapi/openapi.service.js';
import createIndexRouter from './index.route.js';
import IndexService from './index.service.js';

export interface IndexModule extends Module {
  service: IndexService;
}
const createIndexModule = (openapiService: OpenapiService): IndexModule => {
  const service = new IndexService();
  const router = createIndexRouter(openapiService);

  return {
    name: 'index',
    service,
    router,
    routePath: '/',
    entities: [],
  };
};

export default createIndexModule;
