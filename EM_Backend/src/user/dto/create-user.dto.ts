import { IsEmail, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'ABCDE1234F',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN number format',
  })
  panNumber?: string;

  @ApiPropertyOptional({
    example: '123456789012',
  })
  @IsOptional()
  @IsString()
  @Length(12, 12, {
    message: 'Aadhaar number must be 12 digits',
  })
  @Matches(/^\d{12}$/, {
    message: 'Aadhaar number must contain only digits',
  })
  aadhaarNumber?: string;

  @ApiProperty()
  @IsUUID()
  roleId!: string;
}
