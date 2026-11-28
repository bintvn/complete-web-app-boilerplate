import type { Request, Response } from 'express';
import { parseBody, parsePatchId } from '../../core/validation.js';
import {
  createPostSchema,
  postResponseSchema,
  updatePostSchema,
} from '@complete-web-app-boilerplate/shared/modules/post';
import type PostService from './post.service.js';
import { NotFoundError } from '../../core/errors.js';
import {
  serializeRelationDates,
  toResponse,
} from '../../core/response-serializer.js';
import type { PostEntity } from './entities/post.entity.js';
import { requireAuth } from '../../core/middlewares/auth.middleware.js';

function serializePost(post: PostEntity) {
  return toResponse(
    postResponseSchema,
    Object.assign({}, post, {
      categories:
        post.categoryPosts?.map(({ category }) =>
          category ? serializeRelationDates(category) : null
        ) ?? [],
    })
  );
}

export default class PostController {
  readonly name = 'post';

  constructor(private readonly service: PostService) {}

  getAll = async (_request: Request, response: Response) => {
    const posts = await this.service.getAllWithRelations();

    response.json({ data: posts.map(serializePost) });
  };

  get = async (request: Request<{ id: string }>, response: Response) => {
    const post = await this.service.getWithRelations(request.params.id);

    if (!post)
      throw new NotFoundError(
        `${this.name} with ID ${request.params.id} not found`
      );

    response.json({ data: serializePost(post) });
  };

  create = async (request: Request, response: Response) => {
    const auth = requireAuth(request);
    const data = parseBody(createPostSchema, request.body);
    const post = await this.service.create({
      user: {
        id: auth.sub,
      },
      title: data.title,
      content: data.content,
      slug: data.slug,
    });

    response.status(201).json({ data: serializePost(post) });
  };

  update = async (request: Request<{ id: string }>, response: Response) => {
    const id = parsePatchId(request.params.id);
    const data = parseBody(updatePostSchema, request.body);
    await this.service.update(id, data);

    response.status(204).send();
  };

  delete = async (request: Request<{ id: string }>, response: Response) => {
    await this.service.delete(request.params.id);

    response.status(204).send();
  };
}
