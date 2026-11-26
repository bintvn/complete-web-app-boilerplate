import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import createErrorHandler from './middlewares/error.middleware.js';
import createMiddlewares from './middlewares/index.js';
import createRouter from './router.js';
import type { AppConfig } from './types/app.types.js';
import cookieParser from 'cookie-parser';
import createCoreContainer from './bootstrap.js';
import createAppContainer from '../bootstrap.js';
import type { DataSource } from 'typeorm';
import createAuthMiddleware from './middlewares/auth.middleware.js';

const createApp = (appConfig: AppConfig, dbMain: DataSource) => {
  const app = express();
  const authMiddleware = createAuthMiddleware(appConfig);
  const coreContainer = createCoreContainer(appConfig, dbMain, authMiddleware);
  const appContainer = createAppContainer(appConfig, dbMain, authMiddleware);
  const router = createRouter(coreContainer, appContainer);
  const middleware = createMiddlewares();
  const errorHandler = createErrorHandler();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors(appConfig.cors));
  app.use(compression());

  if (appConfig.cookie.secret) app.use(cookieParser(appConfig.cookie.secret));

  app.use(
    morgan(
      ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    )
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(middleware);
  app.use(router);
  app.use(errorHandler);

  return app;
};

export default createApp;
