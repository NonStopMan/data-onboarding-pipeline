import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../master-entities/customer.entity';
import { Site, Building, OnboardingRequest } from '../entities';

@Injectable()
export class CustomerDatabaseService {
  private readonly logger = new Logger(CustomerDatabaseService.name);
  private customerDataSources: Map<string, DataSource> = new Map();

  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async getCustomerDataSource(customerId: string): Promise<DataSource> {
    // Check if connection already exists
    if (this.customerDataSources.has(customerId)) {
      const dataSource = this.customerDataSources.get(customerId);
      if (dataSource && dataSource.isInitialized) {
        return dataSource;
      }
    }

    // Fetch customer from master database
    const customer = await this.customerRepository.findOne({
      where: { customerId, isActive: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found: ${customerId}`);
    }

    // Create new data source for customer
    const dataSource = await this.createCustomerDataSource(customer);
    this.customerDataSources.set(customerId, dataSource);

    this.logger.log(`Created database connection for customer: ${customerId}`);
    return dataSource;
  }

  private async createCustomerDataSource(customer: Customer): Promise<DataSource> {
    const options: DataSourceOptions = {
      type: 'postgres',
      host: customer.dbHost,
      port: customer.dbPort,
      username: customer.dbUsername,
      password: customer.dbPassword,
      database: customer.dbName,
      entities: [Site, Building, OnboardingRequest],
      synchronize: true, // In production, use migrations
      logging: false,
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    return dataSource;
  }

  async getSiteRepository(customerId: string): Promise<Repository<Site>> {
    const dataSource = await this.getCustomerDataSource(customerId);
    return dataSource.getRepository(Site);
  }

  async getBuildingRepository(customerId: string): Promise<Repository<Building>> {
    const dataSource = await this.getCustomerDataSource(customerId);
    return dataSource.getRepository(Building);
  }

  async getOnboardingRequestRepository(
    customerId: string,
  ): Promise<Repository<OnboardingRequest>> {
    const dataSource = await this.getCustomerDataSource(customerId);
    return dataSource.getRepository(OnboardingRequest);
  }

  async closeCustomerConnection(customerId: string): Promise<void> {
    const dataSource = this.customerDataSources.get(customerId);
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      this.customerDataSources.delete(customerId);
      this.logger.log(`Closed database connection for customer: ${customerId}`);
    }
  }

  async closeAllConnections(): Promise<void> {
    for (const [customerId, dataSource] of this.customerDataSources.entries()) {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
        this.logger.log(`Closed database connection for customer: ${customerId}`);
      }
    }
    this.customerDataSources.clear();
  }
}
