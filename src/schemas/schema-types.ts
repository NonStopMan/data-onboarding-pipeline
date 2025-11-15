export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  OBJECT = 'object',
}

export interface FieldMapping {
  customerField: string;
  internalField: string;
  type: FieldType;
  required?: boolean;
  transform?: (value: any) => any;
}

export interface EntitySchemaMapping {
  entity: 'site' | 'building';
  fields: FieldMapping[];
}

export interface CustomerSchema {
  customerId: string;
  customerName: string;
  siteSchema: EntitySchemaMapping;
  buildingSchema: EntitySchemaMapping;
}
