import { CustomerSchema, FieldType } from '../schema-types';

// Default schema - uses our internal field names directly
export const DefaultSchema: CustomerSchema = {
  customerId: 'default',
  customerName: 'Default Customer',
  siteSchema: {
    entity: 'site',
    fields: [
      {
        customerField: 'siteId',
        internalField: 'siteId',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'name',
        internalField: 'name',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'address',
        internalField: 'address',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'city',
        internalField: 'city',
        type: FieldType.STRING,
      },
      {
        customerField: 'state',
        internalField: 'state',
        type: FieldType.STRING,
      },
      {
        customerField: 'zipCode',
        internalField: 'zipCode',
        type: FieldType.STRING,
      },
      {
        customerField: 'country',
        internalField: 'country',
        type: FieldType.STRING,
      },
      {
        customerField: 'latitude',
        internalField: 'latitude',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'longitude',
        internalField: 'longitude',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'metadata',
        internalField: 'metadata',
        type: FieldType.OBJECT,
      },
    ],
  },
  buildingSchema: {
    entity: 'building',
    fields: [
      {
        customerField: 'buildingId',
        internalField: 'buildingId',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'name',
        internalField: 'name',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'buildingType',
        internalField: 'buildingType',
        type: FieldType.STRING,
      },
      {
        customerField: 'floors',
        internalField: 'floors',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'squareFootage',
        internalField: 'squareFootage',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'constructionDate',
        internalField: 'constructionDate',
        type: FieldType.DATE,
      },
      {
        customerField: 'parentSiteId',
        internalField: 'parentSiteId',
        type: FieldType.STRING,
      },
      {
        customerField: 'metadata',
        internalField: 'metadata',
        type: FieldType.OBJECT,
      },
    ],
  },
};
