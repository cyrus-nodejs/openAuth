import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Session,
  SessionSchema,
} from './schemas/session.schema';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TokenModule } from '../token/token.module';
import { UsersModule } from '../users/users.module';
import { SecurityEventModule } from '../security-events/security-event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Session.name,
        schema: SessionSchema,
      },
    ]),
    TokenModule,
    UsersModule,
    SecurityEventModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}