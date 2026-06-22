import { Body, Controller, Get, Post } from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
  })
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Logout',
  })
  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @ApiOperation({
    summary: 'Send password reset email',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset link sent successfully',
  })
  @ApiBody({
    type: ForgotPasswordDto,
  })
  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({
    summary: 'Reset user password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiBody({
    type: ResetPasswordDto,
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
