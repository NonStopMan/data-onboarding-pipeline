import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Unique customer identifier',
    example: 'customer-a',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'Customer A Inc.',
  })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    description: 'Database host for customer data',
    example: 'localhost',
  })
  @IsString()
  @IsNotEmpty()
  dbHost: string;

  @ApiProperty({
    description: 'Database port',
    example: 5432,
  })
  @IsNumber()
  dbPort: number;

  @ApiProperty({
    description: 'Database name',
    example: 'customer_a_db',
  })
  @IsString()
  @IsNotEmpty()
  dbName: string;

  @ApiProperty({
    description: 'Database username',
    example: 'postgres',
  })
  @IsString()
  @IsNotEmpty()
  dbUsername: string;

  @ApiProperty({
    description: 'Database password',
    example: 'postgres',
  })
  @IsString()
  @IsNotEmpty()
  dbPassword: string;

  @ApiProperty({
    description: 'Whether customer is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
