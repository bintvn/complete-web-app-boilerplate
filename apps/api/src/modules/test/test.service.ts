import type { Repository } from 'typeorm';
import type { TestEntity } from './entities/test.entity.js';
import { BaseService } from '../../core/base.service.js';

export default class TestService extends BaseService<
  TestEntity,
  Repository<TestEntity>
> {
  readonly name = 'test';

  constructor(readonly repository: Repository<TestEntity>) {
    super(repository);
  }
}
