import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLeaveDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string = '1';

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string = '10';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leaveTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}
