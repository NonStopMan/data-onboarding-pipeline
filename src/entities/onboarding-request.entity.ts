import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OnboardingStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  VALIDATED = 'VALIDATED',
  PROCESSING = 'PROCESSING',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum EntityType {
  SITE = 'SITE',
  BUILDING = 'BUILDING',
}

@Entity('onboarding_requests')
export class OnboardingRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.PENDING,
  })
  status: OnboardingStatus;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  dependsOnSiteId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
