import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { OnboardingRequest } from '../entities';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OnboardingRequest]),
    DatabaseModule,
  ],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
