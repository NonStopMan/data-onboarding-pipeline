import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  OnboardingRequest,
  OnboardingStatus,
  EntityType,
} from '../entities/onboarding-request.entity';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { OnboardingResponseDto } from '../dto';
import { SchemaRegistryService } from '../schemas/schema-registry.service';
import { SchemaValidatorService } from '../schemas/schema-validator.service';
import { SchemaMapperService } from '../schemas/schema-mapper.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(OnboardingRequest)
    private onboardingRequestRepository: Repository<OnboardingRequest>,
    private kafkaProducerService: KafkaProducerService,
    private configService: ConfigService,
    private schemaRegistry: SchemaRegistryService,
    private schemaValidator: SchemaValidatorService,
    private schemaMapper: SchemaMapperService,
  ) {}

  async onboardSite(customerId: string, customerData: any): Promise<OnboardingResponseDto> {
    const requestId = uuidv4();

    // Get customer schema
    const siteSchema = await this.schemaRegistry.getSiteSchema(customerId);

    // Validate against customer schema
    this.schemaValidator.validate(customerData, siteSchema);

    // Map customer data to internal schema
    const internalData = this.schemaMapper.mapToInternal(customerData, siteSchema);

    this.logger.log(`Site data mapped for customer ${customerId} - Request ID: ${requestId}`);

    // Create onboarding request record
    const onboardingRequest = this.onboardingRequestRepository.create({
      id: requestId,
      customerId,
      entityType: EntityType.SITE,
      status: OnboardingStatus.VALIDATED,
      data: internalData,
    });

    await this.onboardingRequestRepository.save(onboardingRequest);

    // Send to Kafka topic
    const topic = this.configService.get<string>('KAFKA_SITE_TOPIC', 'site-onboarding');

    try {
      await this.kafkaProducerService.sendOnboardingEvent(
        topic,
        requestId,
        internalData,
      );

      this.logger.log(`Site onboarding request sent to Kafka - ID: ${requestId}`);

      return {
        id: requestId,
        entityType: EntityType.SITE,
        status: OnboardingStatus.VALIDATED,
        message: 'Site onboarding request submitted successfully',
        createdAt: onboardingRequest.createdAt,
      };
    } catch (error) {
      // Update status to FAILED
      await this.onboardingRequestRepository.update(requestId, {
        status: OnboardingStatus.FAILED,
        errorMessage: error.message,
      });

      this.logger.error(`Failed to send site onboarding request to Kafka - ID: ${requestId}`, error);
      throw error;
    }
  }

  async onboardBuilding(customerId: string, customerData: any): Promise<OnboardingResponseDto> {
    const requestId = uuidv4();

    // Get customer schema
    const buildingSchema = await this.schemaRegistry.getBuildingSchema(customerId);

    // Validate against customer schema
    this.schemaValidator.validate(customerData, buildingSchema);

    // Map customer data to internal schema
    const internalData = this.schemaMapper.mapToInternal(customerData, buildingSchema);

    this.logger.log(`Building data mapped for customer ${customerId} - Request ID: ${requestId}`);

    // Create onboarding request record
    const onboardingRequest = this.onboardingRequestRepository.create({
      id: requestId,
      customerId,
      entityType: EntityType.BUILDING,
      status: OnboardingStatus.VALIDATED,
      data: internalData,
    });

    await this.onboardingRequestRepository.save(onboardingRequest);

    // Send to Kafka topic
    const topic = this.configService.get<string>('KAFKA_BUILDING_TOPIC', 'building-onboarding');

    try {
      await this.kafkaProducerService.sendOnboardingEvent(
        topic,
        requestId,
        internalData,
      );

      this.logger.log(`Building onboarding request sent to Kafka - ID: ${requestId}`);

      return {
        id: requestId,
        entityType: EntityType.BUILDING,
        status: OnboardingStatus.VALIDATED,
        message: 'Building onboarding request submitted successfully',
        createdAt: onboardingRequest.createdAt,
      };
    } catch (error) {
      // Update status to FAILED
      await this.onboardingRequestRepository.update(requestId, {
        status: OnboardingStatus.FAILED,
        errorMessage: error.message,
      });

      this.logger.error(`Failed to send building onboarding request to Kafka - ID: ${requestId}`, error);
      throw error;
    }
  }

  async getOnboardingStatus(requestId: string): Promise<OnboardingRequest | null> {
    return await this.onboardingRequestRepository.findOne({
      where: { id: requestId },
    });
  }

  async getAllOnboardingRequests(): Promise<OnboardingRequest[]> {
    return await this.onboardingRequestRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
