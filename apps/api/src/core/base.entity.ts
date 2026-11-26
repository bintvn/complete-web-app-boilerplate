import {
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
  PrimaryGeneratedColumn,
  type ObjectLiteral,
} from 'typeorm';

export interface IBaseEntity extends ObjectLiteral {
  id: string;
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

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

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
