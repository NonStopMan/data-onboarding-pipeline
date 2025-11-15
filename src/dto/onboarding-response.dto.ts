import { ApiProperty } from '@nestjs/swagger';
import { OnboardingStatus, EntityType } from '../entities/onboarding-request.entity';

export class OnboardingResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the onboarding request',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of entity being onboarded',
    enum: EntityType,
    example: EntityType.SITE,
  })
  entityType: EntityType;

  @ApiProperty({
    description: 'Current status of the onboarding request',
    enum: OnboardingStatus,
    example: OnboardingStatus.VALIDATED,
  })
  status: OnboardingStatus;

  @ApiProperty({
    description: 'Human-readable message about the onboarding request',
    example: 'Site onboarding request submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the request was created',
    example: '2025-11-15T10:30:00.000Z',
  })
  createdAt: Date;
}
