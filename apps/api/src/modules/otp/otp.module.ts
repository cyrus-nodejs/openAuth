import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OtpChallenge,
  OtpChallengeSchema,
} from './schemas/otp-challenge.schema';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { AuthenticationAttemptModule } from '../auth/authentication-attempt.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OtpChallenge.name,
        schema: OtpChallengeSchema,
      },
    ]),
    EmailModule,
    AuthenticationAttemptModule,
  ],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}