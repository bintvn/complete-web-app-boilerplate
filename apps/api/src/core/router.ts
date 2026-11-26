import { Router } from 'express';
import indexRoutes from './routes/index.route.js';
import { type CoreContainer } from './bootstrap.js';
import notFoundRoute from './routes/not-found.route.js';
import type { AppContainer } from '../bootstrap.js';
import type { Module } from './types/module.types.js';

const createRouter = (
  coreContainer: CoreContainer,
  appContainer: AppContainer
) => {
  const router = Router();

  router.use('/', indexRoutes);

  for (const module of Object.values(coreContainer) as Module[]) {
    if (module.routePath && module.router) {
      router.use(`/${module.routePath}`, module.router);
    }
  }

  for (const module of Object.values(appContainer) as Module[]) {
    if (module.routePath && module.router) {
      router.use(`/${module.routePath}`, module.router);
    }
  }

  router.use(notFoundRoute);

  return router;
};

export default createRouter;
