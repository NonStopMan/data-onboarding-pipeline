import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, SchemaFieldMapping } from '../master-entities';
import { CreateCustomerDto, UpdateCustomerDto, CreateSchemaMappingDto } from './dto';
import { SchemaRegistryService } from '../schemas/schema-registry.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(SchemaFieldMapping)
    private schemaMappingRepository: Repository<SchemaFieldMapping>,
    private schemaRegistryService: SchemaRegistryService,
  ) {}

  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    // Check if customer already exists
    const existing = await this.customerRepository.findOne({
      where: { customerId: dto.customerId },
    });

    if (existing) {
      throw new ConflictException(
        `Customer with ID '${dto.customerId}' already exists`,
      );
    }

    const customer = this.customerRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });

    return await this.customerRepository.save(customer);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found: ${customerId}`);
    }

    return customer;
  }

  async updateCustomer(
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.getCustomerById(customerId);

    Object.assign(customer, dto);
    const updated = await this.customerRepository.save(customer);

    // Clear cache when customer config changes
    await this.schemaRegistryService.clearCache(customerId);

    return updated;
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const customer = await this.getCustomerById(customerId);

    // Delete all schema mappings first
    await this.schemaMappingRepository.delete({ customerId });

    // Delete customer
    await this.customerRepository.remove(customer);

    // Clear cache
    await this.schemaRegistryService.clearCache(customerId);
  }

  async createSchemaMapping(
    customerId: string,
    dto: CreateSchemaMappingDto,
  ): Promise<SchemaFieldMapping> {
    // Verify customer exists
    await this.getCustomerById(customerId);

    // Check if mapping already exists
    const existing = await this.schemaMappingRepository.findOne({
      where: {
        customerId,
        entityType: dto.entityType,
        customerField: dto.customerField,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Mapping for field '${dto.customerField}' in ${dto.entityType} already exists`,
      );
    }

    const mapping = this.schemaMappingRepository.create({
      customerId,
      ...dto,
      isRequired: dto.isRequired ?? false,
    });

    const saved = await this.schemaMappingRepository.save(mapping);

    // Clear cache when schema changes
    await this.schemaRegistryService.clearCache(customerId);

    return saved;
  }

  async getSchemaMappings(customerId: string): Promise<SchemaFieldMapping[]> {
    // Verify customer exists
    await this.getCustomerById(customerId);

    return await this.schemaMappingRepository.find({
      where: { customerId },
      order: { entityType: 'ASC', customerField: 'ASC' },
    });
  }

  async deleteSchemaMapping(mappingId: string): Promise<void> {
    const mapping = await this.schemaMappingRepository.findOne({
      where: { id: mappingId },
    });

    if (!mapping) {
      throw new NotFoundException(`Schema mapping not found: ${mappingId}`);
    }

    await this.schemaMappingRepository.remove(mapping);

    // Clear cache when schema changes
    await this.schemaRegistryService.clearCache(mapping.customerId);
  }
}
