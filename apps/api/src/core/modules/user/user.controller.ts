import type { Request, Response } from 'express';
import { parseBody, parsePatchId } from '../../../core/validation.js';
import {
  createUserSchema,
  updateUserSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/user';
import type UserService from './user.service.js';
import { NotFoundError } from '../../../core/errors.js';
import { serializeUser } from './user.serializer.js';

export default class UserController {
  readonly name = 'user';

  constructor(private readonly service: UserService) {}

  getAll = async (_request: Request, response: Response) => {
    const users = await this.service.getAll();

    response.json({ data: users.map(serializeUser) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const user = await this.service.get(request.params.id);

    if (!user)
      throw new NotFoundError(
        `${this.name} with ID ${request.params.id} not found`
      );

    response.json({ data: serializeUser(user) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(createUserSchema, request.body);
    const user = await this.service.create(data);

    response.status(201).json({ data: serializeUser(user) });
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(updateUserSchema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
