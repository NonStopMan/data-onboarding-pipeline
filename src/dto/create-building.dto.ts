import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({
    description: 'The name of the building',
    example: 'Building A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The type of building',
    example: 'Office',
  })
  @IsString()
  @IsOptional()
  buildingType?: string;

  @ApiPropertyOptional({
    description: 'Number of floors in the building',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  floors?: number;

  @ApiPropertyOptional({
    description: 'Total square footage of the building',
    example: 50000,
  })
  @IsNumber()
  @IsOptional()
  squareFootage?: number;

  @ApiPropertyOptional({
    description: 'Construction date of the building (ISO 8601 format)',
    example: '2020-01-15',
  })
  @IsDateString()
  @IsOptional()
  constructionDate?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the building',
    example: { hasParking: true, parkingSpaces: 200 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'UUID of the site this building belongs to. If the site does not exist yet, the building onboarding will be put ON_HOLD until the site is created.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  siteId?: string;
}
