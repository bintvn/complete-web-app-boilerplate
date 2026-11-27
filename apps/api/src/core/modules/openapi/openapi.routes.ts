import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import helmet from 'helmet';
import { Scalar } from '@scalar/express-api-reference';
import type { RequestHandler } from 'express';
import {
  openApiDocumentSchema,
  type OpenApiDocument,
} from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import { toResponse } from '../../response-serializer.js';
import type OpenapiService from './openapi.service.js';
import type { AppConfig } from '../../types/app.types.js';

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
  router.get('/', (req, res, next) => {
    const nonce = randomBytes(16).toString('base64');
    const policy = helmet.contentSecurityPolicy({
      directives: {
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', `'nonce-${nonce}'`],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      },
    });
    const scalar = Scalar({
      title: appConfig.appName,
      pageTitle: appConfig.appName,
      metaData: {
        title: appConfig.appName,
        description: `${appConfig.appName} API Reference and Documentation`,
      },
      url: '/docs/openapi.json',
      nonce,
      showDeveloperTools: 'localhost',
    }) as RequestHandler;
    policy(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }
      scalar(req, res, next);
    });
  });

  return router;
}
