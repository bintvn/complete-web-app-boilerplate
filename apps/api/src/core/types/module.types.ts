import type { Router } from 'express';
import type { EntitySchema, Repository } from 'typeorm';
import type { BaseService } from '../base.service.js';
import type { BaseEntity, IBaseEntity } from '../base.entity.js';
import type { CoreBaseService } from '../core-base.service.js';

export type EntityConstructor<T extends IBaseEntity = BaseEntity> = new () => T;

export interface Module<
  TEntity extends IBaseEntity = IBaseEntity,
  TRepository extends Repository<TEntity> = Repository<TEntity>,
> {
  name: string;
  routePath?: string;
  service: BaseService<TEntity, TRepository> | CoreBaseService;
  entities?: Array<EntityConstructor<TEntity> | EntitySchema<TEntity>>;
  router?: Router;
  controller?: unknown;
}
