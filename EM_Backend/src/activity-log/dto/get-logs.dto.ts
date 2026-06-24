import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLogsDto {
  @ApiPropertyOptional()
  @IsOptional()
  offset?: string = '0';

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string = '10';

  @ApiPropertyOptional({ description: 'Search by employee name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by employee email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'LOGIN or LOGOUT' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}
