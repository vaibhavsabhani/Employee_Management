import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsOptional,
  IsString,
} from 'class-validator';

export class GetTimeEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string = '1';

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string = '10';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusId?: string;
}