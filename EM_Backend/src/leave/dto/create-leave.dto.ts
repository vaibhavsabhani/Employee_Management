import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const HALF_DAY_SESSIONS = ['first_half', 'second_half'] as const;
export type HalfDaySession = (typeof HALF_DAY_SESSIONS)[number];

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

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @ApiPropertyOptional({ enum: HALF_DAY_SESSIONS })
  @IsIn(HALF_DAY_SESSIONS, {
    message: 'Half day session must be first_half or second_half',
  })
  @IsOptional()
  halfDaySession?: HalfDaySession;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}
