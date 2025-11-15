import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import {
  Site,
  Building,
  OnboardingRequest,
  OnboardingStatus,
  EntityType,
} from '../entities';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @InjectRepository(OnboardingRequest)
    private onboardingRequestRepository: Repository<OnboardingRequest>,
  ) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'data-onboarding-api'),
      brokers: this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
    });

    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>('KAFKA_CONSUMER_GROUP', 'data-onboarding-consumer'),
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log('Kafka consumer connected successfully');

      const topics = [
        this.configService.get<string>('KAFKA_SITE_TOPIC', 'site-onboarding'),
        this.configService.get<string>('KAFKA_BUILDING_TOPIC', 'building-onboarding'),
      ];

      await this.consumer.subscribe({
        topics,
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });

      this.logger.log(`Kafka consumer subscribed to topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to initialize Kafka consumer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Kafka consumer disconnected');
    } catch (error) {
      this.logger.error('Failed to disconnect Kafka consumer', error);
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    const requestId = message.key?.toString();
    const data = JSON.parse(message.value?.toString() || '{}');

    this.logger.log(
      `Processing message - Topic: ${topic}, Partition: ${partition}, Key: ${requestId}`,
    );

    if (!requestId) {
      this.logger.error('Message key (requestId) is missing');
      return;
    }

    try {
      // Update status to PROCESSING
      await this.updateOnboardingStatus(requestId, OnboardingStatus.PROCESSING);

      if (topic === this.configService.get<string>('KAFKA_SITE_TOPIC', 'site-onboarding')) {
        await this.processSite(requestId, data);
      } else if (
        topic === this.configService.get<string>('KAFKA_BUILDING_TOPIC', 'building-onboarding')
      ) {
        await this.processBuilding(requestId, data);
      }

      this.logger.log(`Successfully processed message with key: ${requestId}`);
    } catch (error) {
      this.logger.error(`Failed to process message with key: ${requestId}`, error);
      await this.updateOnboardingStatus(
        requestId,
        OnboardingStatus.FAILED,
        error.message,
      );
    }
  }

  private async processSite(requestId: string, data: any): Promise<void> {
    try {
      const site = this.siteRepository.create(data);
      const savedSite = (await this.siteRepository.save(site)) as unknown as Site;

      await this.updateOnboardingStatus(
        requestId,
        OnboardingStatus.COMPLETED,
        undefined,
        savedSite.id,
      );

      this.logger.log(
        `Site created successfully - Internal ID: ${savedSite.id}, Customer ID: ${savedSite.siteId}`,
      );

      // Check for buildings waiting on this site (using customer siteId)
      await this.processWaitingBuildings(savedSite.siteId);
    } catch (error) {
      this.logger.error('Failed to create site', error);
      throw error;
    }
  }

  private async processBuilding(requestId: string, data: any): Promise<void> {
    try {
      // Check if building has a parent site dependency
      if (data.parentSiteId) {
        const parentSite = await this.siteRepository.findOne({
          where: { siteId: data.parentSiteId },
        });

        if (!parentSite) {
          // Parent site doesn't exist yet, put building on hold
          await this.updateOnboardingStatus(
            requestId,
            OnboardingStatus.ON_HOLD,
            `Waiting for parent site with ID: ${data.parentSiteId}`,
            undefined,
            data.parentSiteId,
          );

          this.logger.log(
            `Building onboarding on hold - waiting for site: ${data.parentSiteId}`,
          );
          return;
        }

        // Site exists, add the internal site ID for the relationship
        data.siteInternalId = parentSite.id;
      }

      const building = this.buildingRepository.create(data);
      const savedBuilding = (await this.buildingRepository.save(building)) as unknown as Building;

      await this.updateOnboardingStatus(
        requestId,
        OnboardingStatus.COMPLETED,
        undefined,
        savedBuilding.id,
      );

      this.logger.log(
        `Building created successfully - Internal ID: ${savedBuilding.id}, Customer ID: ${savedBuilding.buildingId}`,
      );
    } catch (error) {
      this.logger.error('Failed to create building', error);
      throw error;
    }
  }

  private async updateOnboardingStatus(
    requestId: string,
    status: OnboardingStatus,
    errorMessage?: string,
    entityId?: string,
    dependsOnSiteId?: string,
  ): Promise<void> {
    await this.onboardingRequestRepository.update(requestId, {
      status,
      errorMessage,
      entityId,
      dependsOnSiteId,
    });
  }

  private async processWaitingBuildings(siteId: string): Promise<void> {
    try {
      // Find all buildings waiting for this site
      const waitingBuildings = await this.onboardingRequestRepository.find({
        where: {
          entityType: EntityType.BUILDING,
          status: OnboardingStatus.ON_HOLD,
          dependsOnSiteId: siteId,
        },
      });

      if (waitingBuildings.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${waitingBuildings.length} buildings waiting for site ${siteId}. Processing...`,
      );

      // Process each waiting building
      for (const waitingBuilding of waitingBuildings) {
        try {
          await this.updateOnboardingStatus(
            waitingBuilding.id,
            OnboardingStatus.PROCESSING,
          );

          await this.processBuilding(waitingBuilding.id, waitingBuilding.data);

          this.logger.log(
            `Successfully processed waiting building: ${waitingBuilding.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to process waiting building: ${waitingBuilding.id}`,
            error,
          );
          await this.updateOnboardingStatus(
            waitingBuilding.id,
            OnboardingStatus.FAILED,
            error.message,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process waiting buildings for site: ${siteId}`,
        error,
      );
    }
  }
}
