import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { passwordResetTemplate } from './templates/reset-password.template';
import { employeeCreatedTemplate } from './templates/employee-create.template';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;

  constructor(configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
    this.from =
      configService.get<string>('MAIL_FROM') ||
      'Employee Management <onboarding@resend.dev>';
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
    if (error) {
      throw new Error(`Resend: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    await this.sendMail(email, 'Reset Password', passwordResetTemplate(resetLink));
  }

  async sendEmployeeCredentialsEmail(
    email: string,
    employeeName: string,
    password: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      'Your Employee Account Has Been Created',
      employeeCreatedTemplate(employeeName, email, password),
    );
  }
}
