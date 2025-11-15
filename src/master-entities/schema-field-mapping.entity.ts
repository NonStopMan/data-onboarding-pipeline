import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum EntityTypeEnum {
  SITE = 'site',
  BUILDING = 'building',
}

export enum FieldTypeEnum {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  OBJECT = 'object',
}

@Entity('schema_field_mappings')
export class SchemaFieldMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.schemaMappings)
  @JoinColumn({ name: 'customerId', referencedColumnName: 'customerId' })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: EntityTypeEnum,
  })
  entityType: EntityTypeEnum;

  @Column()
  customerField: string;

  @Column()
  internalField: string;

  @Column({
    type: 'enum',
    enum: FieldTypeEnum,
  })
  fieldType: FieldTypeEnum;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'text', nullable: true })
  transformFunction: string; // Store transform function as string if needed

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
