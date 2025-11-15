import { OnboardingStatus, EntityType } from '../entities/onboarding-request.entity';

export class OnboardingResponseDto {
  id: string;
  entityType: EntityType;
  status: OnboardingStatus;
  message: string;
  createdAt: Date;
}
