import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passwordResetTemplate } from './templates/reset-password.template';
import { employeeCreatedTemplate } from './templates/employee-create.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY')!;
    this.senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL')!;
    this.senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') || 'Employee Management';
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
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
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
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
