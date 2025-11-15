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
import { CreateSiteDto, CreateBuildingDto, OnboardingResponseDto } from '../dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(OnboardingRequest)
    private onboardingRequestRepository: Repository<OnboardingRequest>,
    private kafkaProducerService: KafkaProducerService,
    private configService: ConfigService,
  ) {}

  async onboardSite(createSiteDto: CreateSiteDto): Promise<OnboardingResponseDto> {
    const requestId = uuidv4();

    // Create onboarding request record
    const onboardingRequest = this.onboardingRequestRepository.create({
      id: requestId,
      entityType: EntityType.SITE,
      status: OnboardingStatus.VALIDATED,
      data: createSiteDto,
    });

    await this.onboardingRequestRepository.save(onboardingRequest);

    // Send to Kafka topic
    const topic = this.configService.get<string>('KAFKA_SITE_TOPIC', 'site-onboarding');

    try {
      await this.kafkaProducerService.sendOnboardingEvent(
        topic,
        requestId,
        createSiteDto,
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

  async onboardBuilding(createBuildingDto: CreateBuildingDto): Promise<OnboardingResponseDto> {
    const requestId = uuidv4();

    // Create onboarding request record
    const onboardingRequest = this.onboardingRequestRepository.create({
      id: requestId,
      entityType: EntityType.BUILDING,
      status: OnboardingStatus.VALIDATED,
      data: createBuildingDto,
    });

    await this.onboardingRequestRepository.save(onboardingRequest);

    // Send to Kafka topic
    const topic = this.configService.get<string>('KAFKA_BUILDING_TOPIC', 'building-onboarding');

    try {
      await this.kafkaProducerService.sendOnboardingEvent(
        topic,
        requestId,
        createBuildingDto,
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
