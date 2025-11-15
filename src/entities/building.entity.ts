import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  buildingId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  buildingType: string;

  @Column({ type: 'integer', nullable: true })
  floors: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  squareFootage: number;

  @Column({ type: 'date', nullable: true })
  constructionDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  parentSiteId: string;

  @Column({ nullable: true })
  siteInternalId: string;

  @ManyToOne(() => Site, (site) => site.buildings)
  @JoinColumn({ name: 'siteInternalId' })
  site: Site;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
