import type { Repository } from 'typeorm';
import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRole,
  type UpdateRole,
} from '@complete-web-app-boilerplate/shared/core/modules/role';
import { BaseService } from '../../../core/base.service.js';
import type { RoleEntity } from './entities/role.entity.js';
import type { RoleUserEntity } from './entities/role-user.entity.js';

export default class RoleService extends BaseService<RoleEntity> {
  name = 'role';

  constructor(
    protected readonly repository: Repository<RoleEntity>,
    protected readonly userRoleRepository: Repository<RoleUserEntity>
  ) {
    super(repository);
  }

  async create(input: CreateRole) {
    const data = createRoleSchema.parse(input);

    return await this.repository.save(
      this.repository.create({
        ...data,
        description: data.description || null,
      })
    );
  }

  async update(id: string, input: UpdateRole) {
    return super.update(id, updateRoleSchema.parse(input));
  }
}
