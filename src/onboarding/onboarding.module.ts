import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingSchedulerService } from './onboarding-scheduler.service';
import { KafkaModule } from '../kafka/kafka.module';
import { OnboardingRequest, Site, Building } from '../entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OnboardingRequest, Site, Building]),
    KafkaModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingSchedulerService],
})
export class OnboardingModule {}
