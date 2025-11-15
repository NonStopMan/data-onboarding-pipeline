import { DataSource } from 'typeorm';
import { Customer, SchemaFieldMapping, EntityTypeEnum, FieldTypeEnum } from '../master-entities';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seed() {
  // Create connection to master database
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.MASTER_DB_HOST || 'localhost',
    port: parseInt(process.env.MASTER_DB_PORT || '5432'),
    username: process.env.MASTER_DB_USERNAME || 'postgres',
    password: process.env.MASTER_DB_PASSWORD || 'postgres',
    database: process.env.MASTER_DB_DATABASE || 'master_onboarding',
    entities: [Customer, SchemaFieldMapping],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Connected to master database');

    const customerRepository = dataSource.getRepository(Customer);
    const mappingRepository = dataSource.getRepository(SchemaFieldMapping);

    // Create default customer
    const defaultCustomer = customerRepository.create({
      customerId: 'default',
      customerName: 'Default Customer',
      isActive: true,
      dbHost: process.env.DB_HOST || 'localhost',
      dbPort: parseInt(process.env.DB_PORT || '5432'),
      dbName: process.env.DB_DATABASE || 'data_onboarding',
      dbUsername: process.env.DB_USERNAME || 'postgres',
      dbPassword: process.env.DB_PASSWORD || 'postgres',
    });

    const savedCustomer = await customerRepository.save(defaultCustomer);
    console.log(`Created customer: ${savedCustomer.customerId}`);

    // Create schema mappings for sites
    const siteMappings = [
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'siteId',
        internalField: 'siteId',
        fieldType: FieldTypeEnum.STRING,
        isRequired: true,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'name',
        internalField: 'name',
        fieldType: FieldTypeEnum.STRING,
        isRequired: true,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'address',
        internalField: 'address',
        fieldType: FieldTypeEnum.STRING,
        isRequired: true,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'city',
        internalField: 'city',
        fieldType: FieldTypeEnum.STRING,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'state',
        internalField: 'state',
        fieldType: FieldTypeEnum.STRING,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'zipCode',
        internalField: 'zipCode',
        fieldType: FieldTypeEnum.STRING,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'country',
        internalField: 'country',
        fieldType: FieldTypeEnum.STRING,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'latitude',
        internalField: 'latitude',
        fieldType: FieldTypeEnum.NUMBER,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'longitude',
        internalField: 'longitude',
        fieldType: FieldTypeEnum.NUMBER,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.SITE,
        customerField: 'metadata',
        internalField: 'metadata',
        fieldType: FieldTypeEnum.OBJECT,
        isRequired: false,
      },
    ];

    // Create schema mappings for buildings
    const buildingMappings = [
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'buildingId',
        internalField: 'buildingId',
        fieldType: FieldTypeEnum.STRING,
        isRequired: true,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'name',
        internalField: 'name',
        fieldType: FieldTypeEnum.STRING,
        isRequired: true,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'buildingType',
        internalField: 'buildingType',
        fieldType: FieldTypeEnum.STRING,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'floors',
        internalField: 'floors',
        fieldType: FieldTypeEnum.NUMBER,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'squareFootage',
        internalField: 'squareFootage',
        fieldType: FieldTypeEnum.NUMBER,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'constructionDate',
        internalField: 'constructionDate',
        fieldType: FieldTypeEnum.DATE,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'parentSiteId',
        internalField: 'parentSiteId',
        fieldType: FieldTypeEnum.STRING,
        isRequired: false,
      },
      {
        customerId: 'default',
        entityType: EntityTypeEnum.BUILDING,
        customerField: 'metadata',
        internalField: 'metadata',
        fieldType: FieldTypeEnum.OBJECT,
        isRequired: false,
      },
    ];

    const allMappings = [...siteMappings, ...buildingMappings];

    for (const mapping of allMappings) {
      const created = mappingRepository.create(mapping);
      await mappingRepository.save(created);
    }

    console.log(`Created ${allMappings.length} schema field mappings`);
    console.log('Seed data created successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
