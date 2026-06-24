import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiProperty({ example: '2024-01-10', description: 'YYYY-MM-DD' })
  @IsString()
  date!: string;

  @ApiProperty({ description: '1 = Present, 2 = Absent' })
  @IsInt()
  @Min(1)
  statusId!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
