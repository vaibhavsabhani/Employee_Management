import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTimeEntryStatusDto {
  @ApiProperty({
    example: 2,
    description: 'The new status ID for the time entry.',
  })
  @IsInt()
  @Min(1)
  statusId!: number;

  @ApiPropertyOptional({
    description: 'The reason for rejecting the time entry.',
    example: 'Incorrect project code.',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
