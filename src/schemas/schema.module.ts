import { Module } from '@nestjs/common';
import { SchemaRegistryService } from './schema-registry.service';
import { SchemaValidatorService } from './schema-validator.service';
import { SchemaMapperService } from './schema-mapper.service';

@Module({
  providers: [SchemaRegistryService, SchemaValidatorService, SchemaMapperService],
  exports: [SchemaRegistryService, SchemaValidatorService, SchemaMapperService],
})
export class SchemaModule {}
