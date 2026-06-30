import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PunchAction {
  CLOCK_IN = 'clock-in',
  LUNCH_START = 'lunch-start',
  LUNCH_END = 'lunch-end',
  CLOCK_OUT = 'clock-out',
}

export class PunchDto {
  @ApiProperty({ enum: PunchAction })
  @IsEnum(PunchAction, { message: 'Invalid punch action' })
  action!: PunchAction;

  // Required only when action is "clock-out" (validated in the service).
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
