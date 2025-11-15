import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateSiteDto, CreateBuildingDto, OnboardingResponseDto } from '../dto';
import { OnboardingRequest } from '../entities/onboarding-request.entity';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('site')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Onboard a new site',
    description: 'Submit a new site for onboarding. The data will be validated against the customer schema and processed asynchronously via Kafka.',
  })
  @ApiHeader({
    name: 'x-customer-id',
    description: 'Customer identifier for schema mapping (e.g., "customer-a", "default")',
    required: false,
    example: 'default',
  })
  @ApiBody({
    description: 'Site data in customer-specific schema format',
    schema: {
      type: 'object',
      example: {
        siteId: 'SITE-001',
        name: 'Main Campus',
        address: '123 Main Street',
        city: 'San Francisco',
      },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Site onboarding request accepted and queued for processing',
    type: OnboardingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async onboardSite(
    @Headers('x-customer-id') customerId: string = 'default',
    @Body() customerData: any,
  ): Promise<OnboardingResponseDto> {
    return await this.onboardingService.onboardSite(customerId, customerData);
  }

  @Post('building')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Onboard a new building',
    description: 'Submit a new building for onboarding. The data will be validated against the customer schema and processed asynchronously via Kafka.',
  })
  @ApiHeader({
    name: 'x-customer-id',
    description: 'Customer identifier for schema mapping (e.g., "customer-a", "default")',
    required: false,
    example: 'default',
  })
  @ApiBody({
    description: 'Building data in customer-specific schema format',
    schema: {
      type: 'object',
      example: {
        buildingId: 'BLDG-001',
        name: 'Building A',
        buildingType: 'Office',
        parentSiteId: 'SITE-001',
      },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Building onboarding request accepted and queued for processing',
    type: OnboardingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async onboardBuilding(
    @Headers('x-customer-id') customerId: string = 'default',
    @Body() customerData: any,
  ): Promise<OnboardingResponseDto> {
    return await this.onboardingService.onboardBuilding(customerId, customerData);
  }

  @Get('status/:requestId')
  @ApiOperation({
    summary: 'Get onboarding request status',
    description: 'Retrieve the current status and details of an onboarding request by its ID.',
  })
  @ApiParam({
    name: 'requestId',
    description: 'UUID of the onboarding request',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding request details retrieved successfully',
    type: OnboardingRequest,
  })
  @ApiResponse({
    status: 404,
    description: 'Onboarding request not found',
  })
  async getStatus(@Param('requestId') requestId: string): Promise<OnboardingRequest> {
    const request = await this.onboardingService.getOnboardingStatus(requestId);

    if (!request) {
      throw new NotFoundException(`Onboarding request with ID ${requestId} not found`);
    }

    return request as OnboardingRequest;
  }

  @Get('requests')
  @ApiOperation({
    summary: 'Get all onboarding requests',
    description: 'Retrieve a list of all onboarding requests, ordered by creation date (newest first).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of onboarding requests retrieved successfully',
    type: [OnboardingRequest],
  })
  async getAllRequests(): Promise<OnboardingRequest[]> {
    return await this.onboardingService.getAllOnboardingRequests();
  }
}
