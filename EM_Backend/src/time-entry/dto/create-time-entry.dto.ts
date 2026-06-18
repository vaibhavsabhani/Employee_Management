import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateTimeEntryDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty({
    example: '09:00',
  })
  @IsString()
  startTime!: string;

  @ApiProperty({
    example: '18:00',
  })
  @IsString()
  endTime!: string;

  @ApiPropertyOptional({
    example: 30,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  breakDuration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}