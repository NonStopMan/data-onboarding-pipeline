import { Injectable, BadRequestException } from '@nestjs/common';
import { EntitySchemaMapping, FieldType } from './schema-types';

@Injectable()
export class SchemaValidatorService {
  validate(data: any, schema: EntitySchemaMapping): void {
    const errors: string[] = [];

    // Check required fields
    for (const fieldMapping of schema.fields) {
      const value = data[fieldMapping.customerField];

      if (fieldMapping.required && (value === undefined || value === null)) {
        errors.push(
          `Required field '${fieldMapping.customerField}' is missing`,
        );
        continue;
      }

      // Skip validation if field is optional and not provided
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      const typeError = this.validateFieldType(
        fieldMapping.customerField,
        value,
        fieldMapping.type,
      );
      if (typeError) {
        errors.push(typeError);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }
  }

  private validateFieldType(
    fieldName: string,
    value: any,
    expectedType: FieldType,
  ): string | null {
    switch (expectedType) {
      case FieldType.STRING:
        if (typeof value !== 'string') {
          return `Field '${fieldName}' must be a string`;
        }
        break;

      case FieldType.NUMBER:
        if (typeof value !== 'number' || isNaN(value)) {
          return `Field '${fieldName}' must be a number`;
        }
        break;

      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          return `Field '${fieldName}' must be a boolean`;
        }
        break;

      case FieldType.DATE:
        // Accept date strings or Date objects
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return `Field '${fieldName}' must be a valid date`;
        }
        break;

      case FieldType.OBJECT:
        if (typeof value !== 'object' || Array.isArray(value)) {
          return `Field '${fieldName}' must be an object`;
        }
        break;

      default:
        return `Unknown type for field '${fieldName}'`;
    }

    return null;
  }
}
