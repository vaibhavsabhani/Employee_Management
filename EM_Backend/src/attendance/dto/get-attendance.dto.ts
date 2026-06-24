import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAttendanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string = '1';

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string = '10';

  @ApiPropertyOptional({ description: 'YYYY-MM-DD, defaults to today' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeEmail?: string;

  @ApiPropertyOptional({ description: 'present | on-leave | absent' })
  @IsOptional()
  @IsString()
  statusFilter?: string;
}
