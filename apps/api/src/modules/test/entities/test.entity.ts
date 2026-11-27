import { Column, Entity } from 'typeorm';
import { BaseEntity as EntityBase } from '../../../core/base.entity.js';

@Entity('test')
export class TestEntity extends EntityBase {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
  })
  name: string;
}
