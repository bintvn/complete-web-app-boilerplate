import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { BaseEntity } from '../../../base.entity.js';
import { UserEntity } from '../../user/entities/user.entity.js';

@Entity('core__verification')
@Index('UQ_core__verification_user_purpose', ['user', 'purpose'], {
  unique: true,
})
export class VerificationEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  purpose: string;

  @Column({ type: 'varchar', length: 255 })
  destination: string;

  @Column({ name: 'code_digest', type: 'char', length: 64 })
  codeDigest: string;

  @Column({ name: 'expires_at', type: 'datetime', precision: 6 })
  expiresAt: Date;

  @Column({
    name: 'consumed_at',
    type: 'datetime',
    precision: 6,
    nullable: true,
  })
  consumedAt: Date | null;

  @Column({ name: 'failed_attempts', type: 'int' })
  failedAttempts: number;

  @Column({ name: 'issued_at_history', type: 'simple-json' })
  issuedAtHistory: number[];

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Relation<UserEntity>;
}
