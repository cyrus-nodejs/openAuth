import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { CryptoService } from '../../security/crypto.service';
  import { ReplayProtectionService } from '../../security/replay-protection.service';
  import { RateLimitService } from '../../security/rate-limit.service';
  import { EmailService } from '../email/email.service';
  import {
    OtpChallenge,
    OtpChallengeDocument,
  } from './schemas/otp-challenge.schema';
  import { AuthenticationAttemptService } from '../auth/authentication-attempt.service';
  
  @Injectable()
  export class OtpService {
    constructor(
      @InjectModel(OtpChallenge.name)
      private readonly model: Model<OtpChallengeDocument>,
      private readonly config: ConfigService,
      private readonly crypto: CryptoService,
      private readonly replay: ReplayProtectionService,
      private readonly rateLimit: RateLimitService,
      private readonly email: EmailService,
      private readonly attempts: AuthenticationAttemptService,
    ) {}
  
    async issue(input: {
      attemptId: string;
      userId?: string;
      email: string;
      purpose: string;
    }) {
      const rate = await this.rateLimit.consume(
        `otp-send:${input.purpose}`,
        input.email.toLowerCase(),
        5,
        300,
      );
  
      if (!rate.allowed) {
        throw new UnauthorizedException(
          'Too many verification requests',
        );
      }
  
      const ttl = this.config.getOrThrow<number>(
        'OTP_TTL_SECONDS',
      );
  
      const code = this.generateCode();
      const challengeId = `otp_${this.crypto.randomToken(18)}`;
  
      await this.model.create({
        challengeId,
        attemptId: input.attemptId,
        userId: input.userId,
        codeHash: this.crypto.hash(code),
        purpose: input.purpose,
        status: 'active',
        attemptCount: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + ttl * 1000),
      });
  
      await this.email.sendOtp({
        to: input.email,
        code,
        purpose: input.purpose,
        expiresMinutes: Math.ceil(ttl / 60),
      });
  
      return {
        challengeId,
        expiresAt: new Date(
          Date.now() + ttl * 1000,
        ),
      };
    }
  
    async verify(input: {
      challengeId: string;
      code: string;
    }) {
      const challenge = await this.model
        .findOne({
          challengeId: input.challengeId,
        })
        .exec();
  
      if (!challenge) {
        throw new UnauthorizedException(
          'Invalid verification code',
        );
      }
  
      if (
        challenge.status !== 'active' ||
        challenge.expiresAt.getTime() <= Date.now()
      ) {
        throw new UnauthorizedException(
          'Invalid verification code',
        );
      }
  
      if (
        challenge.attemptCount >=
        challenge.maxAttempts
      ) {
        challenge.status = 'locked';
        await challenge.save();
  
        throw new UnauthorizedException(
          'Invalid verification code',
        );
      }
  
      challenge.attemptCount += 1;
  
      if (
        !this.crypto.hashesMatch(
          input.code,
          challenge.codeHash,
        )
      ) {
        await challenge.save();
  
        throw new UnauthorizedException(
          'Invalid verification code',
        );
      }
  
      const consumed = await this.replay.consume(
        'otp',
        challenge.challengeId,
        900,
      );
  
      if (!consumed) {
        throw new UnauthorizedException(
          'Invalid verification code',
        );
      }
  
      challenge.status = 'consumed';
      challenge.consumedAt = new Date();
  
      await challenge.save();
  
      if (challenge.attemptId) {
        const attempt =
          await this.attempts.findByAttemptId(
            challenge.attemptId,
          );
  
        await this.attempts.complete(
          attempt,
          'otp',
        );
      }
  
      return {
        authenticated: true,
        userId: challenge.userId,
      };
    }
  
    private generateCode(): string {
      return Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
    }
  }