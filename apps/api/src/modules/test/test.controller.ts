import type { Request, Response } from 'express';
import { NotFoundError } from '../../core/errors.js';
import { parseBody, parsePatchId } from '../../core/validation.js';
import { toResponse } from '../../core/response-serializer.js';
import {
  createTestSchema,
  testResponseSchema,
  updateTestSchema,
} from '@complete-web-app-boilerplate/shared/modules/test';
import type TestService from './test.service.js';

export default class TestController {
  readonly name = 'test';

  constructor(private readonly service: TestService) {}

  getAll = async (_request: Request, response: Response) => {
    const records = await this.service.getAll();
    response.json({
      data: records.map((record) => toResponse(testResponseSchema, record)),
    });
  };
  get = async (request: Request<{ id: string }>, response: Response) => {
    const record = await this.service.get(request.params.id);

    if (!record)
      throw new NotFoundError(
        `${this.name} with ID ${request.params.id} not found`
      );

    response.json({ data: toResponse(testResponseSchema, record) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(createTestSchema, request.body);
    const record = await this.service.create(data);

    response.status(201).json({ data: toResponse(testResponseSchema, record) });
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(updateTestSchema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
