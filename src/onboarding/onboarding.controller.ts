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
import { OnboardingService } from './onboarding.service';
import { CreateSiteDto, CreateBuildingDto, OnboardingResponseDto } from '../dto';
import { OnboardingRequest } from '../entities/onboarding-request.entity';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('site')
  @HttpCode(HttpStatus.ACCEPTED)
  async onboardSite(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createSiteDto: CreateSiteDto,
  ): Promise<OnboardingResponseDto> {
    return await this.onboardingService.onboardSite(createSiteDto);
  }

  @Post('building')
  @HttpCode(HttpStatus.ACCEPTED)
  async onboardBuilding(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createBuildingDto: CreateBuildingDto,
  ): Promise<OnboardingResponseDto> {
    return await this.onboardingService.onboardBuilding(createBuildingDto);
  }

  @Get('status/:requestId')
  async getStatus(@Param('requestId') requestId: string): Promise<OnboardingRequest> {
    const request = await this.onboardingService.getOnboardingStatus(requestId);

    if (!request) {
      throw new NotFoundException(`Onboarding request with ID ${requestId} not found`);
    }

    return request as OnboardingRequest;
  }

  @Get('requests')
  async getAllRequests(): Promise<OnboardingRequest[]> {
    return await this.onboardingService.getAllOnboardingRequests();
  }
}
