import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'Customer A Inc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({
    description: 'Database host for customer data',
    example: 'localhost',
    required: false,
  })
  @IsString()
  @IsOptional()
  dbHost?: string;

  @ApiProperty({
    description: 'Database port',
    example: 5432,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  dbPort?: number;

  @ApiProperty({
    description: 'Database name',
    example: 'customer_a_db',
    required: false,
  })
  @IsString()
  @IsOptional()
  dbName?: string;

  @ApiProperty({
    description: 'Database username',
    example: 'postgres',
    required: false,
  })
  @IsString()
  @IsOptional()
  dbUsername?: string;

  @ApiProperty({
    description: 'Database password',
    example: 'postgres',
    required: false,
  })
  @IsString()
  @IsOptional()
  dbPassword?: string;

  @ApiProperty({
    description: 'Whether customer is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
