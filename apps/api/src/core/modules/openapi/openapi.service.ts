import {
  OpenApiGeneratorV31,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import type { z } from 'zod';
import { apiErrorSchema } from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import { CoreBaseService } from '../../core-base.service.js';

const documentedApiErrorSchema = apiErrorSchema.meta({ id: 'ApiError' });

export type OpenapiServiceOptions = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: { name?: string; email?: string; url?: string };
    license?: {
      name: string;
      identifier?: string;
      url?: string;
    };
    termsOfService?: string;
  };
  servers?: {
    url: string;
    description?: string;
    variables?: {
      [v: string]: {
        default: string | number | boolean;
        description?: string | undefined;
        enum?: string[] | boolean[] | number[] | undefined;
      };
    };
  }[];
};

export default class OpenapiService extends CoreBaseService {
  name = 'openapi';
  private readonly registryInstance: OpenAPIRegistry;

  constructor(private readonly options: OpenapiServiceOptions) {
    super();

    this.registryInstance = new OpenAPIRegistry();
    this.registryInstance.registerComponent('securitySchemes', 'bearerAuth', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  }

  get registry() {
    return this.registryInstance;
  }

  get bearerSecurity() {
    return [{ bearerAuth: [] }];
  }

  public jsonResponse(description: string, schema: z.ZodType) {
    return { description, content: { 'application/json': { schema } } };
  }

  public generateDocument() {
    return new OpenApiGeneratorV31(
      this.registryInstance.definitions
    ).generateDocument(this.options);
  }

  get errors() {
    return {
      badRequest: {
        ...this.jsonResponse('Malformed request.', documentedApiErrorSchema),
        headers: this.authenticateHeader,
      },
      unauthorized: {
        ...this.jsonResponse(
          'A valid Bearer access token is required.',
          documentedApiErrorSchema
        ),
        headers: this.authenticateHeader,
      },
      notFound: this.jsonResponse(
        'Resource not found.',
        documentedApiErrorSchema
      ),
      conflict: this.jsonResponse(
        'Resource conflicts with an existing record or reference.',
        documentedApiErrorSchema
      ),
      payloadTooLarge: this.jsonResponse(
        'The request body is too large.',
        documentedApiErrorSchema
      ),
      validation: this.jsonResponse(
        'The request failed validation.',
        documentedApiErrorSchema
      ),
      internal: this.jsonResponse(
        'Internal server error.',
        documentedApiErrorSchema
      ),
    };
  }

  private authenticateHeader = {
    'WWW-Authenticate': { schema: { type: 'string' as const } },
  };
}
