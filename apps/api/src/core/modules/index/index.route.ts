import {
  openApiDocumentSchema,
  type OpenApiDocument,
} from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { toResponse } from '../../response-serializer.js';
import type OpenapiService from '../openapi/openapi.service.js';

const createIndexRouter = (openapiService: OpenapiService) => {
  const indexRoutes = Router();

  let document: OpenApiDocument | undefined;

  indexRoutes.get('/openapi.json', (_req, res) => {
    if (!document) {
      document = toResponse(
        openApiDocumentSchema,
        openapiService.generateDocument()
      );
    }

    res.json(document);
  });

  indexRoutes.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome!',
    });
  });

  indexRoutes.get(
    '/openapi.json',
    (req: Request, res: Response, next: NextFunction) => {
      req.url = '/docs/openapi.json';
      const appHandler = req.app as unknown as {
        handle: (req: Request, res: Response, next: NextFunction) => void;
      };
      appHandler.handle(req, res, next);
    }
  );

  return indexRoutes;
};

export default createIndexRouter;
