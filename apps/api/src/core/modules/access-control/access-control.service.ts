import { BaseService } from '../../base.service.js';
import type { Repository } from 'typeorm';
import type { CreateAccessControl } from '@complete-web-app-boilerplate/shared/core/modules/access-control';
import type { AccessControlEntity } from './entities/access-control.entity.js';

export default class AccessControlService extends BaseService<AccessControlEntity> {
  name = 'access-control';

  constructor(protected readonly repository: Repository<AccessControlEntity>) {
    super(repository);
  }

  create(data: CreateAccessControl) {
    return this.manager.transaction(async (manager) => {
      const accessControlRepository = manager.getRepository(
        this.repository.target
      );

      const accessControl = accessControlRepository.create({
        role: {
          id: data.roleId,
        },
        module: {
          id: data.moduleId,
        },
        canCreate: data.canCreate,
        canRead: data.canRead,
        canUpdate: data.canUpdate,
        canDelete: data.canDelete,
      });

      return await accessControlRepository.save(accessControl);
    });
  }
}
