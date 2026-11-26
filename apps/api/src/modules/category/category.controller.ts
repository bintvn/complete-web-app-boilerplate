import type { Request, Response } from 'express';
import { parseBody, parsePatchId } from '../../core/validation.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from './category.schema.js';
import type CategoryService from './category.service.js';
import { NotFoundError } from '../../core/errors.js';
import categoryDto from './category.dto.js';

export default class CategoryController {
  readonly name = 'category';

  constructor(private readonly service: CategoryService) {}

  getAll = async (_request: Request, response: Response) => {
    const categorys = await this.service.getAll();

    response.json({ data: categorys.map(categoryDto) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const category = await this.service.get(request.params.id);

    if (!category)
      throw new NotFoundError(
        `${this.name} with ID ${request.params.id} not found`
      );

    response.json({ data: categoryDto(category) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(createCategorySchema, request.body);
    const category = await this.service.create(data);

    response.status(201).json({ data: categoryDto(category) });
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(updateCategorySchema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
