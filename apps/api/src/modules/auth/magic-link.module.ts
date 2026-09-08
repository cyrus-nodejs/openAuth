import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MagicLinkChallenge,
  MagicLinkChallengeSchema,
} from './schemas/magic-link-challenge.schema';
import { MagicLinkService } from './magic-link.service';
import { AuthenticationAttemptModule } from './authentication-attempt.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MagicLinkChallenge.name,
        schema: MagicLinkChallengeSchema,
      },
    ]),
    AuthenticationAttemptModule,
    EmailModule,
    UsersModule,
  ],
  providers: [MagicLinkService],
  exports: [MagicLinkService],
})
export class MagicLinkModule {}