import { z } from 'zod';
import { patchIdSchema } from '@complete-web-app-boilerplate/shared/core/validation';
import {
  createPostSchema,
  postResponseSchema as responseSchema,
  updatePostSchema,
} from '@complete-web-app-boilerplate/shared/modules/post';
import type OpenapiService from '../../core/modules/openapi/openapi.service.js';

const postResponseSchema = responseSchema.meta({ id: 'Post' });

export function registerPostOpenApi(service: OpenapiService) {
  const tags = ['Posts'];
  const postData = z.object({ data: postResponseSchema });
  const id = z.object({ id: z.string() });

  service.registry.registerPath({
    method: 'get',
    path: '/posts',
    operationId: 'listPosts',
    summary: 'List posts',
    tags,
    security: [],
    responses: {
      200: service.jsonResponse(
        'List of posts.',
        z.object({ data: z.array(postResponseSchema) })
      ),
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'get',
    path: '/posts/{id}',
    operationId: 'getPost',
    summary: 'Get a post',
    tags,
    security: [],
    request: { params: id },
    responses: {
      200: service.jsonResponse('Post details.', postData),
      404: service.errors.notFound,
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'post',
    path: '/posts',
    operationId: 'createPost',
    summary: 'Create a post',
    tags,
    security: service.bearerSecurity,
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: createPostSchema } },
      },
    },
    responses: {
      201: service.jsonResponse('Post created.', postData),
      400: service.errors.badRequest,
      401: service.errors.unauthorized,
      409: service.errors.conflict,
      413: service.errors.payloadTooLarge,
      422: service.errors.validation,
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'patch',
    path: '/posts/{id}',
    operationId: 'updatePost',
    summary: 'Update a post',
    tags,
    security: service.bearerSecurity,
    request: {
      params: z.object({ id: patchIdSchema }),
      body: {
        required: true,
        content: { 'application/json': { schema: updatePostSchema } },
      },
    },
    responses: {
      204: { description: 'Request completed.' },
      400: service.errors.badRequest,
      401: service.errors.unauthorized,
      409: service.errors.conflict,
      413: service.errors.payloadTooLarge,
      422: service.errors.validation,
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'delete',
    path: '/posts/{id}',
    operationId: 'deletePost',
    summary: 'Delete a post',
    tags,
    security: service.bearerSecurity,
    request: { params: id },
    responses: {
      204: { description: 'Post deleted.' },
      400: service.errors.badRequest,
      401: service.errors.unauthorized,
      404: service.errors.notFound,
      409: service.errors.conflict,
      500: service.errors.internal,
    },
  });
}
