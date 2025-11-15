import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerDatabaseService } from './customer-database.service';
import { Customer } from '../master-entities';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomerDatabaseService],
  exports: [CustomerDatabaseService],
})
export class DatabaseModule {}
