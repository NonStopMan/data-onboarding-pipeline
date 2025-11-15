import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { KafkaModule } from '../kafka/kafka.module';
import { OnboardingRequest } from '../entities/onboarding-request.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OnboardingRequest]),
    KafkaModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
