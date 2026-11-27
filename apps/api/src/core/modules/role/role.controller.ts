import type { Request, Response } from 'express';
import type RoleService from './role.service.js';
import {
  createRoleSchema,
  roleResponseSchema,
  updateRoleSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/role';
import { parseBody, parsePatchId } from '../../validation.js';

import {
  serializeRelationDates,
  toResponse,
} from '../../response-serializer.js';
import type { RoleEntity } from './entities/role.entity.js';

function serializeRole(value: RoleEntity) {
  return toResponse(roleResponseSchema, serializeRelationDates(value));
}

export default class RoleController {
  readonly name = 'role';

  constructor(private readonly service: RoleService) {}

  getAll = async (_request: Request, response: Response) => {
    const roles = await this.service.getAll();

    response.json({ data: roles.map(serializeRole) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const role = await this.service.get(request.params.id);

    if (!role)
      throw new Error(`${this.name} with ID ${request.params.id} not found`);

    response.json({ data: serializeRole(role) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(createRoleSchema, request.body);
    const role = await this.service.create(data);

    response.status(201).json({ data: serializeRole(role) });
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(updateRoleSchema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
