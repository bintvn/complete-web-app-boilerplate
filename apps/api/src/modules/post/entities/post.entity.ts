import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { CategoryPostEntity } from '../../category/entities/category-post.entity.js';
import { UserEntity } from '../../../core/modules/user/entities/user.entity.js';
import { BaseEntity } from '../../../core/base.entity.js';

@Entity('post')
@Index('UQ_post_slug', ['slug'], { unique: true })
export class PostEntity extends BaseEntity {
  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    name: 'slug',
    type: 'varchar',
    length: 255,
  })
  slug: string;

  @Column({
    name: 'content',
    type: 'longtext',
  })
  content: string | null;

  @OneToMany(() => CategoryPostEntity, (categoryPost) => categoryPost.post)
  categoryPosts?: Relation<CategoryPostEntity[]>;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_post_user_id',
  })
  user?: Relation<UserEntity>;
}
