import { Body, Controller, Post, Req, Request } from '@nestjs/common';

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
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
  })
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req as any);
  }

  @ApiOperation({
    summary: 'Logout',
  })
  @Post('logout')
  logout(@Request() req: any) {
    return this.authService.logout(req.user?.id);
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

  @ApiOperation({
    summary: 'Change password (logged-in user)',
  })
  @Post('change-password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
