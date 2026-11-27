import type { Request, Response } from 'express';
import { parseBody, parsePatchId } from '../../core/validation.js';
import {
  createCategorySchema,
  categoryResponseSchema,
  updateCategorySchema,
} from '@complete-web-app-boilerplate/shared/modules/category';
import type CategoryService from './category.service.js';
import { NotFoundError } from '../../core/errors.js';
import {
  serializeRelationDates,
  toResponse,
} from '../../core/response-serializer.js';
import type { CategoryEntity } from './entities/category.entity.js';

function serializeCategory(category: CategoryEntity) {
  return toResponse(
    categoryResponseSchema,
    Object.assign({}, category, {
      posts:
        category.categoryPosts?.map(({ post }) =>
          post ? serializeRelationDates(post) : null
        ) ?? [],
    })
  );
}

export default class CategoryController {
  readonly name = 'category';

  constructor(private readonly service: CategoryService) {}

  getAll = async (_request: Request, response: Response) => {
    const categories = await this.service.getAllWithRelations();

    response.json({ data: categories.map(serializeCategory) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const category = await this.service.getWithRelations(request.params.id);

    if (!category)
      throw new NotFoundError(
        `${this.name} with ID ${request.params.id} not found`
      );

    response.json({ data: serializeCategory(category) });
  };

  create = async (request: Request, response: Response) => {
    const data = parseBody(createCategorySchema, request.body);
    const category = await this.service.create(data);

    response.status(201).json({ data: serializeCategory(category) });
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
