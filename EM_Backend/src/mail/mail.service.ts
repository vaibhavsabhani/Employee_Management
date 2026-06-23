import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { passwordResetTemplate } from './templates/reset-password.template';
import { employeeCreatedTemplate } from './templates/employee-create.template';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      'Reset Password',
      passwordResetTemplate(resetLink),
    );
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
