import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerSchema, EntitySchemaMapping, FieldMapping, FieldType } from './schema-types';
import {
  Customer,
  SchemaFieldMapping,
  EntityTypeEnum,
  FieldTypeEnum,
} from '../master-entities';

@Injectable()
export class SchemaRegistryService {
  private schemasCache: Map<string, CustomerSchema> = new Map();

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(SchemaFieldMapping)
    private schemaMappingRepository: Repository<SchemaFieldMapping>,
  ) {}

  async getSchema(customerId: string): Promise<CustomerSchema> {
    // Check cache first
    if (this.schemasCache.has(customerId)) {
      return this.schemasCache.get(customerId) as CustomerSchema;
    }

    // Load from database
    const customer = await this.customerRepository.findOne({
      where: { customerId, isActive: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found: ${customerId}`);
    }

    // Load schema mappings
    const mappings = await this.schemaMappingRepository.find({
      where: { customerId },
    });

    if (mappings.length === 0) {
      throw new NotFoundException(
        `No schema mappings found for customer: ${customerId}`,
      );
    }

    // Build schema from mappings
    const schema = this.buildSchemaFromMappings(customer, mappings);

    // Cache the schema
    this.schemasCache.set(customerId, schema);

    return schema;
  }

  private buildSchemaFromMappings(
    customer: Customer,
    mappings: SchemaFieldMapping[],
  ): CustomerSchema {
    const siteMappings = mappings.filter(
      (m) => m.entityType === EntityTypeEnum.SITE,
    );
    const buildingMappings = mappings.filter(
      (m) => m.entityType === EntityTypeEnum.BUILDING,
    );

    return {
      customerId: customer.customerId,
      customerName: customer.customerName,
      siteSchema: {
        entity: 'site',
        fields: this.convertToFieldMappings(siteMappings),
      },
      buildingSchema: {
        entity: 'building',
        fields: this.convertToFieldMappings(buildingMappings),
      },
    };
  }

  private convertToFieldMappings(
    mappings: SchemaFieldMapping[],
  ): FieldMapping[] {
    return mappings.map((mapping) => ({
      customerField: mapping.customerField,
      internalField: mapping.internalField,
      type: this.convertFieldType(mapping.fieldType),
      required: mapping.isRequired,
    }));
  }

  private convertFieldType(type: FieldTypeEnum): FieldType {
    switch (type) {
      case FieldTypeEnum.STRING:
        return FieldType.STRING;
      case FieldTypeEnum.NUMBER:
        return FieldType.NUMBER;
      case FieldTypeEnum.BOOLEAN:
        return FieldType.BOOLEAN;
      case FieldTypeEnum.DATE:
        return FieldType.DATE;
      case FieldTypeEnum.OBJECT:
        return FieldType.OBJECT;
      default:
        return FieldType.STRING;
    }
  }

  async getSiteSchema(customerId: string): Promise<EntitySchemaMapping> {
    const schema = await this.getSchema(customerId);
    return schema.siteSchema;
  }

  async getBuildingSchema(customerId: string): Promise<EntitySchemaMapping> {
    const schema = await this.getSchema(customerId);
    return schema.buildingSchema;
  }

  async clearCache(customerId?: string): Promise<void> {
    if (customerId) {
      this.schemasCache.delete(customerId);
    } else {
      this.schemasCache.clear();
    }
  }

  async getAllCustomerIds(): Promise<string[]> {
    const customers = await this.customerRepository.find({
      where: { isActive: true },
      select: ['customerId'],
    });
    return customers.map((c) => c.customerId);
  }
}
