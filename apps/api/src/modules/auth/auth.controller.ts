import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
  } from '@nestjs/common';
  import type { Request } from 'express';
  import { StartAuthenticationDto } from './dto/start-authentication.dto';
  import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';
  import { UserRepository } from '../users/repositories/user.repository';
  import { AuthenticationAttemptService } from './authentication-attempt.service';
  import { MagicLinkService } from './magic-link.service';
  import { RiskEngineService } from '../risk/risk-engine.service';
  import { CryptoService } from '../../security/crypto.service';
  import { RateLimitService } from '../../security/rate-limit.service';
  
  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly users: UserRepository,
      private readonly attempts: AuthenticationAttemptService,
      private readonly magicLinks: MagicLinkService,
      private readonly risk: RiskEngineService,
      private readonly crypto: CryptoService,
      private readonly rateLimit: RateLimitService,
    ) {}
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
      @Body() dto: StartAuthenticationDto,
      @Req() request: Request,
    ) {
      const emailNormalized =
        dto.email.trim().toLowerCase();
  
      const rate = await this.rateLimit.consume(
        'login',
        emailNormalized,
        10,
        300,
      );
  
      if (!rate.allowed) {
        return {
          success: true,
          data: {
            loginAttemptId: null,
            risk: {
              level: 'medium',
              requiredMethods: ['magic_link'],
            },
          },
        };
      }
  
      const user =
        await this.users.findByEmail(emailNormalized);
  
      const fingerprintHash =
        dto.fingerprint
          ? this.crypto.fingerprint(
              JSON.stringify(dto.fingerprint),
            )
          : undefined;
  
      const ip =
        request.ip ?? 'unknown';
  
      const risk = this.risk.evaluate({
        userExists: Boolean(user),
        fingerprintKnown: Boolean(
          fingerprintHash && user,
        ),
        ipVelocity: 0,
        failedAttempts: 0,
      });
  
      const attempt =
        await this.attempts.create({
          emailNormalized,
          userId: user?._id.toString(),
          purpose: 'login',
          riskLevel: risk.level,
          requiredMethods: risk.requiredMethods,
          fingerprintHash,
          ipHash: this.crypto.hash(ip),
          userAgentHash: dto.userAgent
            ? this.crypto.hash(dto.userAgent)
            : undefined,
        });
  
      return {
        success: true,
        data: {
          loginAttemptId: attempt.attemptId,
          risk: {
            level: risk.level,
            requiredMethods: risk.requiredMethods,
          },
        },
      };
    }
  
    @Post('login/magic-link')
    @HttpCode(HttpStatus.OK)
    async sendMagicLink(
      @Body('loginAttemptId') loginAttemptId: string,
    ) {
      const attempt =
        await this.attempts.findByAttemptId(
          loginAttemptId,
        );
  
      if (!attempt.emailNormalized) {
        return {
          success: true,
          data: {
            challengeId: null,
          },
        };
      }
  
      const user =
        await this.users.findByEmail(
          attempt.emailNormalized,
        );
  
      await this.magicLinks.issue({
        attemptId: attempt.attemptId,
        email: attempt.emailNormalized,
        userId: user?._id.toString(),
        fingerprintHash: attempt.fingerprintHash,
      });
  
      return {
        success: true,
        data: {
          challengeId: 'issued',
          expiresAt: attempt.expiresAt,
        },
      };
    }
  
    @Post('login/magic-link/verify')
    @HttpCode(HttpStatus.OK)
    async verifyMagicLink(
      @Body() dto: VerifyMagicLinkDto,
    ) {
      const result =
        await this.magicLinks.verify(dto);
  
      return {
        success: true,
        data: result,
      };
    }
  }