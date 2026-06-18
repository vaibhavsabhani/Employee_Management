import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user =
      await this.prisma.user.findUnique({
        where: {
          email: email.toLowerCase().trim(),
        },
        include: {
          role: true,
        },
      });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    const {
      password: _,
      ...userResponse
    } = user;

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: userResponse,
    };
  }

  async logout() {
    return {
      success: true,
      message: 'Logout successful',
    };
  }
}