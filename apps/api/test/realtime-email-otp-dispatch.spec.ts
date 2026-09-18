import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { EmailService } from '../src/modules/email/email.service';
import { RedisService } from '../src/redis/redis.service';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Real-Time Email & OTP Dispatch Service', () => {
  let authService: AuthService;
  let emailService: EmailService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        EmailService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({ id: 'u1' }),
            },
          },
        },
        {
          provide: RedisService,
          useFactory: () => {
            const store = new Map<string, string>();
            return {
              get: jest.fn().mockImplementation(async (key: string) => store.get(key) || null),
              set: jest.fn().mockImplementation(async (key: string, val: string) => {
                store.set(key, val);
              }),
              del: jest.fn().mockImplementation(async (key: string) => {
                store.delete(key);
              }),
            };
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    emailService = moduleRef.get<EmailService>(EmailService);
  });

  it('generates and dispatches a 6-digit cryptographic numeric OTP', async () => {
    const sendOtpSpy = jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValue({
      success: true,
      previewUrl: 'https://ethereal.email/message/12345',
    });

    const result = await authService.sendOtp({ email: 'sv6546670@gmail.com' });

    expect(result.success).toBe(true);
    expect(sendOtpSpy).toHaveBeenCalledTimes(1);
    const [targetEmail, otpCode] = sendOtpSpy.mock.calls[0];
    expect(targetEmail).toBe('sv6546670@gmail.com');
    expect(otpCode).toMatch(/^[0-9]{6}$/);
  });

  it('verifies a valid OTP code and prevents reuse', async () => {
    let capturedOtp = '';
    jest.spyOn(emailService, 'sendOtpEmail').mockImplementation(async (_email, code) => {
      capturedOtp = code;
      return { success: true };
    });

    await authService.sendOtp({ email: 'testuser@example.com' });
    expect(capturedOtp.length).toBe(6);

    // Valid check
    const isValid = await authService.verifyOtp({
      email: 'testuser@example.com',
      code: capturedOtp,
    });
    expect(isValid).toBe(true);

    // Subsequent check should fail (one-time use)
    const isReusedValid = await authService.verifyOtp({
      email: 'testuser@example.com',
      code: capturedOtp,
    });
    expect(isReusedValid).toBe(false);
  });

  it('rejects an incorrect OTP code', async () => {
    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValue({
      success: true,
    });

    await authService.sendOtp({ email: 'user@example.com' });
    const isInvalidValid = await authService.verifyOtp({
      email: 'user@example.com',
      code: '000000',
    });
    expect(isInvalidValid).toBe(false);
  });
});
