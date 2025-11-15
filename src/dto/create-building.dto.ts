import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  buildingType?: string;

  @IsNumber()
  @IsOptional()
  floors?: number;

  @IsNumber()
  @IsOptional()
  squareFootage?: number;

  @IsDateString()
  @IsOptional()
  constructionDate?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsUUID()
  @IsOptional()
  siteId?: string;
}
