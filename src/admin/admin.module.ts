import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Customer, SchemaFieldMapping } from '../master-entities';
import { SchemaModule } from '../schemas/schema.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, SchemaFieldMapping]),
    SchemaModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
