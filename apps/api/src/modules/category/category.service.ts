import type { Repository } from 'typeorm';
import { BaseService } from '../../core/base.service.js';
import type { CategoryEntity, CategoryPostEntity } from './entities/index.js';

export default class CategoryService extends BaseService<
  CategoryEntity,
  Repository<CategoryEntity>
> {
  name = 'category';

  constructor(
    readonly repository: Repository<CategoryEntity>,
    readonly categoryPostRepository: Repository<CategoryPostEntity>
  ) {
    super(repository);
  }
}
