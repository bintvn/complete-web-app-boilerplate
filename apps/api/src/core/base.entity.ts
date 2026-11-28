import {
  CreateDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
  PrimaryGeneratedColumn,
  type ObjectLiteral,
} from 'typeorm';

export interface IBaseEntity extends ObjectLiteral {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
    default: null,
  })
  updatedAt: Date | null;

  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  @Column({
    name: 'disabled',
    type: 'boolean',
    default: false,
  })
  disabled: boolean;
}
