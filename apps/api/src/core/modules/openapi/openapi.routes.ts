import express from 'express';
import { Router } from 'express';
import { Scalar } from '@scalar/express-api-reference';
import {
  openApiDocumentSchema,
  type OpenApiDocument,
} from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import { toResponse } from '../../response-serializer.js';
import type OpenapiService from './openapi.service.js';
import type { AppConfig } from '../../types/app.types.js';
import path from 'node:path';

export default function createOpenapiRouter(
  appConfig: AppConfig,
  openapiService: OpenapiService
) {
  const router = Router();
  let document: OpenApiDocument | undefined;

  router.get('/openapi.json', (_req, res) => {
    if (!document) {
      document = toResponse(
        openApiDocumentSchema,
        openapiService.generateDocument()
      );
    }

    res.json(document);
  });
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
      url: '/docs/openapi.json',
      cdn: '/docs/assets/standalone.js',
      showDeveloperTools: 'localhost',
      withDefaultFonts: false,
    })
  );

  return router;
}
