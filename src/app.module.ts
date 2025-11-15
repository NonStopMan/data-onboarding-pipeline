import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OnboardingModule } from './onboarding/onboarding.module';
import { KafkaModule } from './kafka/kafka.module';
import { DatabaseModule } from './database/database.module';
import { SchemaModule } from './schemas/schema.module';
import { AdminModule } from './admin/admin.module';
import { Customer, SchemaFieldMapping } from './master-entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    // Master database connection - stores customer configs and schema mappings
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('MASTER_DB_HOST'),
        port: configService.get('MASTER_DB_PORT'),
        username: configService.get('MASTER_DB_USERNAME'),
        password: configService.get('MASTER_DB_PASSWORD'),
        database: configService.get('MASTER_DB_DATABASE'),
        entities: [Customer, SchemaFieldMapping],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    SchemaModule,
    AdminModule,
    OnboardingModule,
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
