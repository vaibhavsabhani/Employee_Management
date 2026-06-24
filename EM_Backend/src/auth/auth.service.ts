import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { MailService } from '@/mail/mail.service';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (Array.isArray(forwarded) ? forwarded[0] : forwarded)
        .split(',')[0]
        .trim();
    }
    return req.socket?.remoteAddress ?? '127.0.0.1';
  }

  private parseAgent(ua: string) {
    const parser = new UAParser(ua);
    const b = parser.getBrowser();
    const o = parser.getOS();
    const d = parser.getDevice();
    return {
      browser: [b.name, b.version].filter(Boolean).join(' ') || null,
      os: [o.name, o.version].filter(Boolean).join(' ') || null,
      device: d.type ?? 'Desktop',
    };
  }

  private getGeo(ip: string) {
    try {
      const geo = geoip.lookup(ip);
      if (!geo) return { country: null, city: null, region: null };
      return { country: geo.country ?? null, city: geo.city ?? null, region: geo.region ?? null };
    } catch {
      return { country: null, city: null, region: null };
    }
  }

  async login(loginDto: LoginDto, req: Request) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        role: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Log login activity
    const ip = this.extractIp(req);
    const ua = (req.headers['user-agent'] as string) ?? '';
    const { browser, os, device } = this.parseAgent(ua);
    const { country, city, region } = this.getGeo(ip);

    await this.prisma.userActivityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: ip,
        userAgent: ua || null,
        browser,
        os,
        device,
        country,
        city,
        region,
      },
    });

    const { password: _, ...userResponse } = user;

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: userResponse,
    };
  }

  async logout(userId: string) {
    const latestLog = await this.prisma.userActivityLog.findFirst({
      where: { userId, action: 'LOGIN', logoutAt: null },
      orderBy: { loginAt: 'desc' },
    });

    if (latestLog) {
      await this.prisma.userActivityLog.update({
        where: { id: latestLog.id },
        data: { logoutAt: new Date(), action: 'LOGOUT' },
      });
    }

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.isActive) {
      return {
        success: true,
        message:
          'If the email is registered, a password reset link has been sent.',
      };
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const frontendUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      success: true,
      message:
        'If the email is registered, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: {
        token: tokenHash,
      },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
