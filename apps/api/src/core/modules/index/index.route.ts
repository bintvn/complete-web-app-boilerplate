import {
  openApiDocumentSchema,
  type OpenApiDocument,
} from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import { Router } from 'express';
import { toResponse } from '../../response-serializer.js';
import type OpenapiService from '../openapi/openapi.service.js';

const createIndexRouter = (openapiService: OpenapiService) => {
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

  router.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome!',
    });
  });

  return router;
};

export default createIndexRouter;
