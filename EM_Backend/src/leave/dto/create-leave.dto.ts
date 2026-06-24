import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLeaveDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  leaveTypeId!: number;

  @ApiProperty({ example: '2024-01-10' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-01-12' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}
