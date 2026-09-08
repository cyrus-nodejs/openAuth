import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { CryptoService } from '../../security/crypto.service';
  import {
    Session,
    SessionDocument,
  } from './schemas/session.schema';
  
  @Injectable()
  export class SessionService {
    constructor(
      @InjectModel(Session.name)
      private readonly model: Model<SessionDocument>,
      private readonly config: ConfigService,
      private readonly crypto: CryptoService,
    ) {}
  
    async create(input: {
      userId: string;
      riskLevel: string;
      authenticationLevel: string;
      fingerprintHash?: string;
      userAgentHash?: string;
      ipHash?: string;
    }) {
      const sessionId =
        `ses_${this.crypto.randomToken(18)}`;
  
      const tokenFamilyId =
        `fam_${this.crypto.randomToken(18)}`;
  
      const ttl = this.config.getOrThrow<number>(
        'REFRESH_TOKEN_TTL_SECONDS',
      );
  
      const expiresAt = new Date(
        Date.now() + ttl * 1000,
      );
  
      return this.model.create({
        sessionId,
        userId: input.userId,
        tokenFamilyId,
        authenticationLevel:
          input.authenticationLevel,
        riskLevel: input.riskLevel,
        fingerprintHash: input.fingerprintHash,
        userAgentHash: input.userAgentHash,
        ipHash: input.ipHash,
        lastActivityAt: new Date(),
        expiresAt,
      });
    }
  
    async findActive(sessionId: string) {
      const session = await this.model.findOne({
        sessionId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      }).exec();
  
      if (!session) {
        throw new UnauthorizedException(
          'Session is not active',
        );
      }
  
      return session;
    }
  
    async revoke(
      sessionId: string,
      reason = 'manual_logout',
    ) {
      return this.model.findOneAndUpdate(
        {
          sessionId,
          revokedAt: { $exists: false },
        },
        {
          $set: {
            revokedAt: new Date(),
            revokeReason: reason,
          },
        },
        { new: true },
      ).exec();
    }
  
    async revokeFamily(
      tokenFamilyId: string,
      reason = 'token_reuse',
    ) {
      return this.model.updateMany(
        {
          tokenFamilyId,
          revokedAt: { $exists: false },
        },
        {
          $set: {
            revokedAt: new Date(),
            revokeReason: reason,
          },
        },
      ).exec();
    }
  }