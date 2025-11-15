import { Injectable } from '@nestjs/common';
import { EntitySchemaMapping, FieldType } from './schema-types';

@Injectable()
export class SchemaMapperService {
  mapToInternal(customerData: any, schema: EntitySchemaMapping): any {
    const internalData: any = {};

    for (const fieldMapping of schema.fields) {
      const customerValue = customerData[fieldMapping.customerField];

      // Skip if value is undefined or null
      if (customerValue === undefined || customerValue === null) {
        continue;
      }

      // Apply transformation if specified
      let mappedValue = customerValue;
      if (fieldMapping.transform) {
        mappedValue = fieldMapping.transform(customerValue);
      } else {
        // Default transformation based on type
        mappedValue = this.transformValue(customerValue, fieldMapping.type);
      }

      internalData[fieldMapping.internalField] = mappedValue;
    }

    return internalData;
  }

  private transformValue(value: any, type: FieldType): any {
    switch (type) {
      case FieldType.STRING:
        return String(value);

      case FieldType.NUMBER:
        return Number(value);

      case FieldType.BOOLEAN:
        return Boolean(value);

      case FieldType.DATE:
        // Convert to ISO string format
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return new Date(value).toISOString().split('T')[0];

      case FieldType.OBJECT:
        return value;

      default:
        return value;
    }
  }
}
