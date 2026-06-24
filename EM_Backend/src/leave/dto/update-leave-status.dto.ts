import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLeaveStatusDto {
  @ApiProperty({ example: 2, description: '2=Approved, 3=Rejected' })
  @IsInt()
  @Min(1)
  statusId!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
