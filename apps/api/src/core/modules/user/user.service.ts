import type { EntityManager, Repository } from 'typeorm';
import type { UserEntity } from './entities/user.entity.js';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUser,
  type UpdateUser,
} from '@complete-web-app-boilerplate/shared/core/modules/user';
import { BaseService } from '../../../core/base.service.js';
import passwordUtil from '../../utils/password.util.js';
import { RoleEntity } from '../role/entities/role.entity.js';
import { NotFoundError } from '../../../core/errors.js';
import type { UserServiceDependencies } from './index.js';
import { RoleUserEntity } from '../role/entities/role-user.entity.js';

export default class UserService extends BaseService<
  UserEntity,
  Repository<UserEntity>
> {
  name = 'user';

  constructor(
    readonly repository: Repository<UserEntity>,
    readonly dependencies: UserServiceDependencies
  ) {
    super(repository);
  }

  async create(input: CreateUser, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;
    const roleUserRepository = manager
      ? manager.getRepository(RoleUserEntity)
      : repository.manager.getRepository(RoleUserEntity);
    const data = createUserSchema.parse(input);
    const roleIdsToCreate: RoleEntity['id'][] = [];

    if (input.roleIds) {
      const roles = await this.dependencies.roleService.getByIds(
        input.roleIds,
        manager
      );
      const roleIds = roles.map((role) => role.id);
      const roleIdsNotFoundInDB = input.roleIds.filter(
        (id) => !roleIds.includes(id)
      );

      if (roleIdsNotFoundInDB.length > 0)
        throw new NotFoundError(
          `Roles with IDs ${roleIdsNotFoundInDB.join(', ')} not found`
        );

      roleIdsToCreate.push(...roleIds);
    } else {
      const role = await this.dependencies.roleService.getBy(
        { slug: 'user' },
        manager
      );

      if (!role) throw new NotFoundError('User Role not found');

      roleIdsToCreate.push(role.id);
    }

    let passwordHash: string | undefined;

    if (data.password) passwordHash = await passwordUtil.hash(data.password);

    const userRecord = repository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    const user = await repository.save(userRecord);

    const userRoleRecord: RoleUserEntity[] = [];

    for (const roleId of roleIdsToCreate) {
      userRoleRecord.push(
        roleUserRepository.create({
          role: {
            id: roleId,
          },
          user,
        })
      );
    }

    await roleUserRepository.save(userRoleRecord);

    return (await repository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        roleUsers: {
          role: true,
        },
      },
    })) as UserEntity & {
      userRoles: (RoleUserEntity & {
        role: RoleEntity;
      })[];
    };
  }

  async update(id: string, input: UpdateUser) {
    const data = updateUserSchema.parse(input);
    const partial: Partial<UserEntity> = {};

    if (data.name !== undefined) partial.name = data.name;
    if (data.email !== undefined) partial.email = data.email;
    if (data.password !== undefined)
      partial.passwordHash = await passwordUtil.hash(data.password);

    if (Object.keys(partial).length > 0) {
      await this.repository.update(id, partial);

      return true;
    }

    return false;
  }
}
