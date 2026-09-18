import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const rawPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
    const smtpPass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`SMTP Email Transporter initialized with host: ${smtpHost}`);
    } else if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Gmail SMTP Transporter initialized for ${smtpUser}`);
    } else {
      this.logger.warn(
        'No SMTP credentials found in environment. Initializing fallback Ethereal / development transport.'
      );
      this.initFallbackTransporter();
    }
  }

  private async initFallbackTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Ethereal Test Mailer initialized: ${testAccount.user}`);
    } catch (err) {
      this.logger.warn('Could not initialize Ethereal test account:', err);
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; previewUrl?: string }> {
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const fromAddress =
      process.env.EMAIL_FROM ||
      (smtpUser ? `"Sony Sound" <${smtpUser}>` : '"Sony Sound Verification" <security@sonysound.com>');

    const subject = `${otpCode} is your Sony Sound verification code`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sony Sound Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0d0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0d0e; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #161618; border: 1px solid #26262a; border-radius: 16px; overflow: hidden; padding: 36px 32px;">
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="display: inline-block; width: 48px; height: 48px; border-radius: 24px; background-color: #ffffff; line-height: 48px; text-align: center; color: #000000; font-size: 24px; font-weight: 900;">
                      S
                    </div>
                    <div style="font-size: 18px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin-top: 12px;">
                      SONY SOUND
                    </div>
                    <div style="font-size: 11px; color: #888892; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">
                      Social Listening & Realtime Presence
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="border-top: 1px solid #26262a; padding-top: 24px;">
                    <div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">
                      Verify your identity
                    </div>
                    <div style="font-size: 13px; line-height: 20px; color: #a1a1aa; margin-bottom: 24px;">
                      Use the 6-digit verification code below to complete creating your sound profile on Sony Sound.
                    </div>

                    <!-- OTP Code Badge -->
                    <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <div style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 600;">
                        Security Verification Code
                      </div>
                      <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981; font-family: monospace;">
                        ${otpCode}
                      </div>
                      <div style="font-size: 11px; color: #71717a; margin-top: 8px;">
                        Valid for 10 minutes · Do not share this code
                      </div>
                    </div>

                    <div style="font-size: 12px; line-height: 18px; color: #71717a;">
                      If you did not request this verification code, you can safely ignore this email. Someone may have mistakenly typed your email address.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="border-top: 1px solid #26262a; padding-top: 20px; margin-top: 24px; text-align: center; font-size: 11px; color: #52525b;">
                    © ${new Date().getFullYear()} Sony Sound Platform. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 1. Try Resend API if API Key is set
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [toEmail],
            subject,
            html,
          }),
        });

        if (response.ok) {
          this.logger.log(`[Resend API] Verification email delivered to ${toEmail}`);
          return { success: true };
        } else {
          const errData = await response.json();
          this.logger.warn('[Resend API] Delivery error:', errData);
        }
      } catch (err) {
        this.logger.warn('[Resend API] Fetch failed, trying SMTP fallback:', err);
      }
    }

    // 2. Try Nodemailer SMTP
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject,
          html,
          text: `Your Sony Sound verification code is ${otpCode}. It expires in 10 minutes.`,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        this.logger.log(
          `[SMTP] Verification email sent to ${toEmail}. MessageId: ${info.messageId}${
            previewUrl ? ` | Preview: ${previewUrl}` : ''
          }`
        );

        return { success: true, previewUrl };
      } catch (err) {
        this.logger.error(`[SMTP] Failed to send email to ${toEmail}:`, err);
      }
    }

    this.logger.warn(`Could not deliver live email to ${toEmail}. Check SMTP/Resend environment config.`);
    return { success: false };
  }
}
