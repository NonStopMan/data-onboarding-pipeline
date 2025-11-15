import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SchemaFieldMapping } from './schema-field-mapping.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  customerId: string;

  @Column()
  customerName: string;

  @Column({ default: true })
  isActive: boolean;

  // Database connection details for this customer
  @Column()
  dbHost: string;

  @Column({ type: 'integer' })
  dbPort: number;

  @Column()
  dbName: string;

  @Column()
  dbUsername: string;

  @Column()
  dbPassword: string;

  @OneToMany(() => SchemaFieldMapping, (mapping) => mapping.customer)
  schemaMappings: SchemaFieldMapping[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
