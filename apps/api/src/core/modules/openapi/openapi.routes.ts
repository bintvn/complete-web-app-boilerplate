import express from 'express';
import { Router } from 'express';
import { Scalar } from '@scalar/express-api-reference';
import type { AppConfig } from '../../types/app.types.js';
import path from 'node:path';

export default function createOpenapiRouter(appConfig: AppConfig) {
  const router = Router();

  router.use(
    '/assets',
    express.static(
      path.join(
        process.cwd(),
        'node_modules/@scalar/api-reference/dist/browser'
      )
    )
  );
  router.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
    );
    next();
  });
  router.use(
    '/',
    Scalar({
      title: appConfig.appName,
      pageTitle: appConfig.appName,
      metaData: {
        title: appConfig.appName,
        description: `${appConfig.appName} API Reference and Documentation`,
      },
      url: '/openapi.json',
      cdn: '/docs/assets/standalone.js',
      showDeveloperTools: 'localhost',
      withDefaultFonts: false,
    })
  );

  return router;
}
