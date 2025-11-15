import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaRegistryService } from './schema-registry.service';
import { SchemaValidatorService } from './schema-validator.service';
import { SchemaMapperService } from './schema-mapper.service';
import { Customer, SchemaFieldMapping } from '../master-entities';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, SchemaFieldMapping])],
  providers: [SchemaRegistryService, SchemaValidatorService, SchemaMapperService],
  exports: [SchemaRegistryService, SchemaValidatorService, SchemaMapperService],
})
export class SchemaModule {}
