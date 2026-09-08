import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { ConfigService } from '@nestjs/config';
  import { Model } from 'mongoose';
  import { CryptoService } from '../../security/crypto.service';
  import { RateLimitService } from '../../security/rate-limit.service';
  import { UserRepository } from '../users/repositories/user.repository';
  import { OtpService } from '../otp/otp.service';
  import {
    RecoveryAttempt,
    RecoveryAttemptDocument,
  } from './schemas/recovery-attempt.schema';
  import {
    RecoveryCode,
    RecoveryCodeDocument,
  } from './schemas/recovery-code.schema';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  
  @Injectable()
  export class RecoveryService {
    constructor(
      @InjectModel(RecoveryAttempt.name)
      private readonly attemptsModel:
        Model<RecoveryAttemptDocument>,
      @InjectModel(RecoveryCode.name)
      private readonly codesModel:
        Model<RecoveryCodeDocument>,
      private readonly config: ConfigService,
      private readonly crypto: CryptoService,
      private readonly rateLimit: RateLimitService,
      private readonly users: UserRepository,
      private readonly otp: OtpService,
      private readonly events: SecurityEventService,
    ) {}
  
    async start(email: string) {
      const normalized =
        email.trim().toLowerCase();
  
      const rate = await this.rateLimit.consume(
        'recovery',
        normalized,
        5,
        900,
      );
  
      if (!rate.allowed) {
        throw new UnauthorizedException(
          'Recovery request cannot be processed',
        );
      }
  
      const user =
        await this.users.findByEmail(normalized);
  
      const ttl = this.config.getOrThrow<number>(
        'RECOVERY_ATTEMPT_TTL_SECONDS',
      );
  
      const recoveryAttemptId =
        `rec_${this.crypto.randomToken(18)}`;
  
      const attempt =
        await this.attemptsModel.create({
          recoveryAttemptId,
          userId: user?._id,
          emailNormalized: normalized,
          riskLevel: 'high',
          requiredMethods: ['otp'],
          completedMethods: [],
          status: 'pending',
          expiresAt: new Date(
            Date.now() + ttl * 1000,
          ),
        });
  
      if (user) {
        await this.otp.issue({
          attemptId: recoveryAttemptId,
          userId: user._id.toString(),
          email: user.email,
          purpose: 'recovery',
        });
  
        await this.events.record({
          userId: user._id,
          attemptId: recoveryAttemptId,
          eventType:
            SecurityEventType.RECOVERY_STARTED,
        });
      }
  
      return {
        recoveryAttemptId,
        availableMethods: [
          'otp',
          'recovery_code',
        ],
      };
    }
  
    async verifyCode(
      recoveryAttemptId: string,
      recoveryCode: string,
    ) {
      const attempt =
        await this.attemptsModel.findOne({
          recoveryAttemptId,
          status: 'pending',
          expiresAt: { $gt: new Date() },
        });
  
      if (!attempt?.userId) {
        throw new UnauthorizedException(
          'Recovery failed',
        );
      }
  
      const codes =
        await this.codesModel.find({
          userId: attempt.userId,
          status: 'active',
          revokedAt: { $exists: false },
          usedAt: { $exists: false },
        });
  
      const matched = codes.find((code) =>
        this.crypto.hashesMatch(
          recoveryCode,
          code.codeHash,
        ),
      );
  
      if (!matched) {
        throw new UnauthorizedException(
          'Recovery failed',
        );
      }
  
      matched.status = 'used';
      matched.usedAt = new Date();
      await matched.save();
  
      attempt.completedMethods.push(
        'recovery_code',
      );
      attempt.status = 'completed';
      attempt.completedAt = new Date();
      await attempt.save();
  
      await this.events.record({
        userId: attempt.userId,
        attemptId: recoveryAttemptId,
        eventType:
          SecurityEventType.RECOVERY_COMPLETED,
      });
  
      return {
        verified: true,
        userId: attempt.userId.toString(),
      };
    }
  
    async regenerateCodes(userId: string) {
      const objectId =
        new (require('mongoose').Types.ObjectId)(
          userId,
        );
  
      await this.codesModel.updateMany(
        {
          userId: objectId,
          status: 'active',
        },
        {
          $set: {
            status: 'revoked',
            revokedAt: new Date(),
          },
        },
      );
  
      const codes = Array.from(
        { length: 10 },
        (_, index) => ({
          index,
          value:
            `${this.crypto.randomToken(6)}-${this.crypto.randomToken(6)}`,
        }),
      );
  
      await this.codesModel.insertMany(
        codes.map((code) => ({
          userId: objectId,
          codeHash: this.crypto.hash(code.value),
          codeIndex: code.index,
          status: 'active',
        })),
      );
  
      return codes.map((code) => code.value);
    }
  }