import { CustomerSchema, FieldType } from '../schema-types';

// Customer A uses different field names
export const CustomerASchema: CustomerSchema = {
  customerId: 'customer-a',
  customerName: 'Customer A',
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
        customerField: 'siteName',
        internalField: 'name',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'streetAddress',
        internalField: 'address',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'cityName',
        internalField: 'city',
        type: FieldType.STRING,
      },
      {
        customerField: 'stateCode',
        internalField: 'state',
        type: FieldType.STRING,
      },
      {
        customerField: 'postalCode',
        internalField: 'zipCode',
        type: FieldType.STRING,
      },
      {
        customerField: 'countryName',
        internalField: 'country',
        type: FieldType.STRING,
      },
      {
        customerField: 'lat',
        internalField: 'latitude',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'lng',
        internalField: 'longitude',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'additionalData',
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
        customerField: 'buildingName',
        internalField: 'name',
        type: FieldType.STRING,
        required: true,
      },
      {
        customerField: 'type',
        internalField: 'buildingType',
        type: FieldType.STRING,
      },
      {
        customerField: 'numberOfFloors',
        internalField: 'floors',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'area',
        internalField: 'squareFootage',
        type: FieldType.NUMBER,
      },
      {
        customerField: 'builtDate',
        internalField: 'constructionDate',
        type: FieldType.DATE,
      },
      {
        customerField: 'siteReference',
        internalField: 'parentSiteId',
        type: FieldType.STRING,
      },
      {
        customerField: 'extra',
        internalField: 'metadata',
        type: FieldType.OBJECT,
      },
    ],
  },
};
