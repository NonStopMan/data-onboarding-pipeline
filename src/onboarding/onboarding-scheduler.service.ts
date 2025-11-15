import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OnboardingRequest,
  OnboardingStatus,
  EntityType,
  Site,
  Building,
} from '../entities';

@Injectable()
export class OnboardingSchedulerService {
  private readonly logger = new Logger(OnboardingSchedulerService.name);

  constructor(
    @InjectRepository(OnboardingRequest)
    private onboardingRequestRepository: Repository<OnboardingRequest>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
  ) {}

  // Run every 30 seconds to check for ON_HOLD buildings
  @Cron(CronExpression.EVERY_30_SECONDS)
  async retryOnHoldBuildings() {
    try {
      const onHoldBuildings = await this.onboardingRequestRepository.find({
        where: {
          entityType: EntityType.BUILDING,
          status: OnboardingStatus.ON_HOLD,
        },
      });

      if (onHoldBuildings.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${onHoldBuildings.length} buildings on hold. Checking if parent sites are ready...`,
      );

      for (const buildingRequest of onHoldBuildings) {
        await this.retryBuildingOnboarding(buildingRequest);
      }
    } catch (error) {
      this.logger.error('Failed to retry on-hold buildings', error);
    }
  }

  private async retryBuildingOnboarding(
    buildingRequest: OnboardingRequest,
  ): Promise<void> {
    try {
      const { dependsOnSiteId, data } = buildingRequest;

      if (!dependsOnSiteId) {
        this.logger.warn(
          `Building ${buildingRequest.id} on hold but has no dependsOnSiteId`,
        );
        return;
      }

      // Check if the parent site exists now
      const parentSite = await this.siteRepository.findOne({
        where: { id: dependsOnSiteId },
      });

      if (parentSite) {
        this.logger.log(
          `Parent site ${dependsOnSiteId} is ready. Processing building ${buildingRequest.id}`,
        );

        // Update status to PROCESSING
        await this.onboardingRequestRepository.update(buildingRequest.id, {
          status: OnboardingStatus.PROCESSING,
        });

        // Create the building
        const building = this.buildingRepository.create(data);
        const savedBuilding = (await this.buildingRepository.save(
          building,
        )) as unknown as Building;

        // Update status to COMPLETED
        await this.onboardingRequestRepository.update(buildingRequest.id, {
          status: OnboardingStatus.COMPLETED,
          entityId: savedBuilding.id,
          errorMessage: undefined,
        });

        this.logger.log(
          `Building ${buildingRequest.id} successfully created with ID: ${savedBuilding.id}`,
        );
      } else {
        this.logger.debug(
          `Parent site ${dependsOnSiteId} still not available for building ${buildingRequest.id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to retry building onboarding for ${buildingRequest.id}`,
        error,
      );

      // Mark as FAILED
      await this.onboardingRequestRepository.update(buildingRequest.id, {
        status: OnboardingStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }
}
