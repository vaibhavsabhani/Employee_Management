import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6',
    description: 'Password reset token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'New password',
    minLength: 8,
  })
  @MinLength(8)
  password: string;
}