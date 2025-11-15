import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateSchemaMappingDto } from './dto';
import { Customer, SchemaFieldMapping } from '../master-entities';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('customers')
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: Customer,
  })
  @ApiResponse({ status: 409, description: 'Customer already exists' })
  async createCustomer(@Body() dto: CreateCustomerDto): Promise<Customer> {
    return await this.adminService.createCustomer(dto);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of all customers',
    type: [Customer],
  })
  async getAllCustomers(): Promise<Customer[]> {
    return await this.adminService.getAllCustomers();
  }

  @Get('customers/:customerId')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({
    name: 'customerId',
    description: 'Customer identifier',
    example: 'customer-a',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer details',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(
    @Param('customerId') customerId: string,
  ): Promise<Customer> {
    return await this.adminService.getCustomerById(customerId);
  }

  @Put('customers/:customerId')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({
    name: 'customerId',
    description: 'Customer identifier',
    example: 'customer-a',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.adminService.updateCustomer(customerId, dto);
  }

  @Delete('customers/:customerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({
    name: 'customerId',
    description: 'Customer identifier',
    example: 'customer-a',
  })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async deleteCustomer(@Param('customerId') customerId: string): Promise<void> {
    await this.adminService.deleteCustomer(customerId);
  }

  @Post('customers/:customerId/schema-mappings')
  @ApiOperation({ summary: 'Create schema field mapping for customer' })
  @ApiParam({
    name: 'customerId',
    description: 'Customer identifier',
    example: 'customer-a',
  })
  @ApiResponse({
    status: 201,
    description: 'Schema mapping created successfully',
    type: SchemaFieldMapping,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Mapping already exists' })
  async createSchemaMapping(
    @Param('customerId') customerId: string,
    @Body() dto: CreateSchemaMappingDto,
  ): Promise<SchemaFieldMapping> {
    return await this.adminService.createSchemaMapping(customerId, dto);
  }

  @Get('customers/:customerId/schema-mappings')
  @ApiOperation({ summary: 'Get all schema mappings for customer' })
  @ApiParam({
    name: 'customerId',
    description: 'Customer identifier',
    example: 'customer-a',
  })
  @ApiResponse({
    status: 200,
    description: 'List of schema mappings',
    type: [SchemaFieldMapping],
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getSchemaMappings(
    @Param('customerId') customerId: string,
  ): Promise<SchemaFieldMapping[]> {
    return await this.adminService.getSchemaMappings(customerId);
  }

  @Delete('schema-mappings/:mappingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete schema mapping' })
  @ApiParam({
    name: 'mappingId',
    description: 'Schema mapping ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Schema mapping deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Schema mapping not found' })
  async deleteSchemaMapping(
    @Param('mappingId') mappingId: string,
  ): Promise<void> {
    await this.adminService.deleteSchemaMapping(mappingId);
  }
}
