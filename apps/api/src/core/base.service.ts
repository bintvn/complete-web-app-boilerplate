import {
  EntityManager,
  In,
  IsNull,
  Not,
  type DeepPartial,
  type FindManyOptions,
  type FindOptionsWhere,
  type QueryDeepPartialEntity,
  type Repository,
} from 'typeorm';
import { NotFoundError } from './errors.js';
import type { IBaseEntity } from './base.entity.js';

export abstract class BaseService<
  TEntity extends IBaseEntity,
  TRepository extends Repository<TEntity> = Repository<TEntity>,
> {
  abstract readonly name: string;
  protected readonly manager: EntityManager;

  constructor(protected readonly repository: TRepository) {
    this.manager = repository.manager;
  }

  async getAll(options?: FindManyOptions<TEntity>, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    return repository.find(options);
  }

  async get(id: TEntity['id'], manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    return await repository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });
  }

  async getBy(where: FindOptionsWhere<TEntity>, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    return await repository.findOne({
      where,
    });
  }

  async getByIds(ids: TEntity['id'][], manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    return await repository.find({
      where: { id: In(ids) } as FindOptionsWhere<TEntity>,
    });
  }

  async create(data: DeepPartial<TEntity>, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const entity = repository.create(data);

    return await repository.save(entity);
  }

  async update(
    id: TEntity['id'],
    newData: QueryDeepPartialEntity<TEntity>,
    manager?: EntityManager
  ) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    if (Object.keys(newData).length > 0) {
      const payload = {
        updatedAt: new Date(),
        ...newData,
      } as QueryDeepPartialEntity<TEntity>;

      await repository.update(id, payload);

      return true;
    }

    return false;
  }

  async delete(id: TEntity['id'], manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const result = await repository.delete(id);

    if (result.affected === 0)
      throw new NotFoundError(`${this.name} with ID ${id} not found`);

    return true;
  }

  async softDelete(
    id: TEntity['id'],
    manager?: EntityManager
  ): Promise<boolean> {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const result = await repository.softDelete({
      id,
      deletedAt: IsNull(),
    } as FindOptionsWhere<TEntity>);

    if (!result.affected) {
      throw new NotFoundError(`${this.name} with ID ${id} not found`);
    }

    return true;
  }

  async restore(id: TEntity['id'], manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    return await repository.update(
      {
        id,
        deletedAt: Not(IsNull()),
      } as FindOptionsWhere<TEntity>,
      {
        deletedAt: null,
      } as unknown as QueryDeepPartialEntity<TEntity>
    );
  }

  getServiceName() {
    return this.name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
