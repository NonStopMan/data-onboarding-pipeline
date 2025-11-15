import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingSchedulerService } from './onboarding-scheduler.service';
import { KafkaModule } from '../kafka/kafka.module';
import { SchemaModule } from '../schemas/schema.module';
import { DatabaseModule } from '../database/database.module';
import { OnboardingRequest } from '../entities';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OnboardingRequest]),
    DatabaseModule,
    KafkaModule,
    SchemaModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingSchedulerService],
})
export class OnboardingModule {}
