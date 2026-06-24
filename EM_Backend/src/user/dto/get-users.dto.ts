import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsOptional,
  IsString,
} from 'class-validator';

export class GetUsersDto {
  @ApiPropertyOptional()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string = '10';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}