import type { Repository } from 'typeorm';
import type { PostEntity } from './entities/post.entity.js';
import { BaseService } from '../../core/base.service.js';

const relations = { categoryPosts: { category: true } };

export default class PostService extends BaseService<
  PostEntity,
  Repository<PostEntity>
> {
  name = 'post';

  getAllWithRelations() {
    return this.getAll({ relations });
  }

  getWithRelations(id: string) {
    return this.repository.findOne({ where: { id }, relations });
  }

  constructor(readonly repository: Repository<PostEntity>) {
    super(repository);
  }
}
