import type { Repository } from 'typeorm';
import { BaseService } from '../../core/base.service.js';
import type { CategoryEntity, CategoryPostEntity } from './entities/index.js';

const relations = { categoryPosts: { post: true } };

export default class CategoryService extends BaseService<
  CategoryEntity,
  Repository<CategoryEntity>
> {
  name = 'category';

  getAllWithRelations() {
    return this.getAll({ relations });
  }

  getWithRelations(id: string) {
    return this.repository.findOne({ where: { id }, relations });
  }

  constructor(
    readonly repository: Repository<CategoryEntity>,
    readonly categoryPostRepository: Repository<CategoryPostEntity>
  ) {
    super(repository);
  }
}
