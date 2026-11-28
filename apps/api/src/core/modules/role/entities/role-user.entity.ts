import { Entity, JoinColumn, ManyToOne, Unique, type Relation } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity.js';
import { RoleEntity } from './role.entity.js';
import { BaseEntity } from '../../../base.entity.js';

@Entity('core__role_user')
@Unique('UQ_core__role_user', ['user', 'role'])
export class RoleUserEntity extends BaseEntity {
  @ManyToOne(() => RoleEntity, (role) => role.userRoles, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_role_role_id',
  })
  role?: Relation<RoleEntity>;

  @ManyToOne(() => UserEntity, (user) => user.roleUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_role_user_id',
  })
  user?: Relation<UserEntity>;
}
