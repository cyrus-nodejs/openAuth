import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { TokenService } from './token.service';
import { AccessTokenService } from './access-token.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
    ]),
    SessionModule,
  ],
  providers: [
    TokenService,
    AccessTokenService,
  ],
  exports: [
    TokenService,
    AccessTokenService,
  ],
})
export class TokenModule {}