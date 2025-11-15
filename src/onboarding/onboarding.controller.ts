import {
  Controller,
  Post,
  Get,
  Body,
  Param,
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
    description: 'Submit a new site for onboarding. The data will be validated and processed asynchronously via Kafka.',
  })
  @ApiBody({ type: CreateSiteDto })
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
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createSiteDto: CreateSiteDto,
  ): Promise<OnboardingResponseDto> {
    return await this.onboardingService.onboardSite(createSiteDto);
  }

  @Post('building')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Onboard a new building',
    description: 'Submit a new building for onboarding. The data will be validated and processed asynchronously via Kafka.',
  })
  @ApiBody({ type: CreateBuildingDto })
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
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createBuildingDto: CreateBuildingDto,
  ): Promise<OnboardingResponseDto> {
    return await this.onboardingService.onboardBuilding(createBuildingDto);
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
