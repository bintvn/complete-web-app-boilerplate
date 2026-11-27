import type { Request, Response } from 'express';
import { parseBody, parsePatchId } from '../../validation.js';
import type AccessControlService from './access-control.service.js';
import {
  accessControlResponseSchema,
  createAccessControlSchema,
  updateAccessControlSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/access-control';

import {
  serializeRelationDates,
  toResponse,
} from '../../response-serializer.js';
import type { AccessControlEntity } from './entities/access-control.entity.js';

function serializeAccessControl(accessControl: AccessControlEntity) {
  return toResponse(
    accessControlResponseSchema,
    Object.assign(serializeRelationDates(accessControl), {
      role: accessControl.role
        ? serializeRelationDates(accessControl.role)
        : null,
      module: accessControl.module
        ? serializeRelationDates(accessControl.module)
        : null,
    })
  );
}

export default class AccessControlController {
  readonly name = 'access-control';

  constructor(private readonly service: AccessControlService) {}

  getAll = async (_request: Request, response: Response) => {
    const accessControls = await this.service.getAll();

    response.json({ data: accessControls.map(serializeAccessControl) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const accessControl = await this.service.get(request.params.id);

    if (!accessControl)
      throw new Error(`${this.name} with ID ${request.params.id} not found`);

    response.json({ data: serializeAccessControl(accessControl) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(createAccessControlSchema, request.body);
    const accessControl = await this.service.create(data);

    response.status(201).json({ data: serializeAccessControl(accessControl) });
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(updateAccessControlSchema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
