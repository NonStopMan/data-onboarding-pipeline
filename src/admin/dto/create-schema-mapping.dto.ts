import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityTypeEnum, FieldTypeEnum } from '../../master-entities';

export class CreateSchemaMappingDto {
  @ApiProperty({
    description: 'Entity type (site or building)',
    enum: EntityTypeEnum,
    example: EntityTypeEnum.SITE,
  })
  @IsEnum(EntityTypeEnum)
  @IsNotEmpty()
  entityType: EntityTypeEnum;

  @ApiProperty({
    description: 'Customer field name',
    example: 'siteName',
  })
  @IsString()
  @IsNotEmpty()
  customerField: string;

  @ApiProperty({
    description: 'Internal field name',
    example: 'name',
  })
  @IsString()
  @IsNotEmpty()
  internalField: string;

  @ApiProperty({
    description: 'Field type',
    enum: FieldTypeEnum,
    example: FieldTypeEnum.STRING,
  })
  @IsEnum(FieldTypeEnum)
  @IsNotEmpty()
  fieldType: FieldTypeEnum;

  @ApiProperty({
    description: 'Whether field is required',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}
