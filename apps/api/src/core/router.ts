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

  const mountedPaths = new Set<string>();
  const mountedNames = new Set<string>();
  for (const module of Object.values(coreContainer)) {
    if (module.routePath && module.router) {
      mountedPaths.add(module.routePath.toLowerCase());
      mountedNames.add(module.name);
      router.use(`/${module.routePath}`, module.router);
    }
  }

  const appModules: Module[] = Object.values(appContainer);
  for (const module of appModules) {
    if (module.routePath && module.router) {
      const routePath = module.routePath.toLowerCase();
      if (mountedPaths.has(routePath) || mountedNames.has(module.name)) {
        throw new Error(
          `Duplicate API module or route: ${module.name} (/${routePath})`
        );
      }
      mountedPaths.add(routePath);
      mountedNames.add(module.name);
      router.use(`/${module.routePath}`, module.router);
    }
  }

  router.use(notFoundRoute);

  return router;
};

export default createRouter;
