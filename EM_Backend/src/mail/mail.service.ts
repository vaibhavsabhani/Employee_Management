import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { passwordResetTemplate } from './templates/reset-password.template';
import { employeeCreatedTemplate } from './templates/employee-create.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('BREVO_SMTP_USER'),
        pass: this.configService.get<string>('BREVO_SMTP_KEY'),
      },
    });

    this.from = `${
      this.configService.get<string>('BREVO_SENDER_NAME') ||
      'Employee Management'
    } <${this.configService.get<string>('BREVO_SENDER_EMAIL')}>`;

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP Connection Failed', error);
      } else {
        this.logger.log('SMTP Server is ready');
      }
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    });

    this.logger.log(`Email sent: ${info.messageId}`);
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