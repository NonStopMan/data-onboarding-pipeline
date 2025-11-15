import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerSchema, EntitySchemaMapping } from './schema-types';
import { DefaultSchema } from './customer-schemas/default.schema';
import { CustomerASchema } from './customer-schemas/customer-a.schema';

@Injectable()
export class SchemaRegistryService {
  private schemas: Map<string, CustomerSchema> = new Map();

  constructor() {
    // Register all customer schemas
    this.registerSchema(DefaultSchema);
    this.registerSchema(CustomerASchema);
  }

  private registerSchema(schema: CustomerSchema): void {
    this.schemas.set(schema.customerId, schema);
  }

  getSchema(customerId: string): CustomerSchema {
    const schema = this.schemas.get(customerId);
    if (!schema) {
      throw new NotFoundException(
        `Schema not found for customer: ${customerId}`,
      );
    }
    return schema;
  }

  getSiteSchema(customerId: string): EntitySchemaMapping {
    return this.getSchema(customerId).siteSchema;
  }

  getBuildingSchema(customerId: string): EntitySchemaMapping {
    return this.getSchema(customerId).buildingSchema;
  }

  getAllCustomerIds(): string[] {
    return Array.from(this.schemas.keys());
  }
}
