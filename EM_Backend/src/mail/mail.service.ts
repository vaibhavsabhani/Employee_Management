import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { passwordResetTemplate } from './templates/reset-password.template';
import { employeeCreatedTemplate } from './templates/employee-create.template';
import { passwordChangedTemplate } from './templates/password-changed.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY')!;
    this.senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL')!;
    this.senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') || 'Employee Management';
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    userId?: string,
  ): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }

    this.logger.log(`Email sent to ${to}`);

    if (userId) {
      await this.prisma.emailLog.create({
        data: { userId, to, subject, body: html },
      });
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userId?: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      'Reset Password',
      passwordResetTemplate(resetLink),
      userId,
    );
  }

  async sendPasswordChangedEmail(
    email: string,
    name: string,
    newPassword: string,
    userId?: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      'Your Password Has Been Changed',
      passwordChangedTemplate(name, email, newPassword),
      userId,
    );
  }

  async sendEmployeeCredentialsEmail(
    email: string,
    employeeName: string,
    password: string,
    userId?: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      'Your Employee Account Has Been Created',
      employeeCreatedTemplate(employeeName, email, password, this.frontendUrl),
      userId,
    );
  }
}
