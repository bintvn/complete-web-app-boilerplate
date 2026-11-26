import type { Repository } from 'typeorm';
import { BaseService } from '../../base.service.js';
import type { ModuleEntity } from './entities/module.entity.js';

export default class ModuleService extends BaseService<
  ModuleEntity,
  Repository<ModuleEntity>
> {
  name = 'module';

  constructor(readonly repository: Repository<ModuleEntity>) {
    super(repository);
  }
}
