import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envConfig } from './config/env.config';
import {
  APP_GUARD,
} from '@nestjs/core';


import { AccessTokenGuard } from './common/auth/access-token.guard';
import { RequestContextMiddleware } from './common/request-context/request-context.middleware';
import { RequestContextModule } from './common/request-context/request-context.module';

import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { SecurityModule } from './security/security.module';
import { SecurityPrimitivesModule } from './security/security-primitives.module';
import { ReplayProtectionModule } from './security/replay-protection.module';


import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { AuthenticationAttemptModule } from './modules/auth/authentication-attempt.module';
import { MagicLinkModule } from './modules/auth/magic-link.module';
import { OtpModule } from './modules/otp/otp.module';
import { RiskModule } from './modules/risk/risk.module';
import { SessionModule } from './modules/session/session.module';
import { TokenModule } from './modules/token/token.module';


import { SignupModule } from './modules/signup/signup.module';
import { RecoveryModule } from './modules/recovery/recovery.module';
import { GoogleModule } from './modules/google/google.module';
import { PasskeyModule } from './modules/passkey/passkey.module';

import { SecurityEventModule } from './modules/security-events/security-event.module';
import { FingerprintModule } from './modules/fingerprint/fingerprint.module';

import { AuthController } from './modules/auth/auth.controller';
import { OtpController } from './modules/otp/otp.controller';
import { TokenController } from './modules/token/token.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('db.uri'),
      }),
      inject: [ConfigService],
    }),
 
    AppConfigModule,
    DatabaseModule,
    RedisModule,
    SecurityModule,
    SecurityPrimitivesModule,
    ReplayProtectionModule,
    RequestContextModule,

    UsersModule,
    EmailModule,
    AuthenticationAttemptModule,
    MagicLinkModule,
    OtpModule,
    RiskModule,
    SessionModule,
    TokenModule,

    SignupModule,
    RecoveryModule,
    GoogleModule,
    PasskeyModule,

    SecurityEventModule,
    FingerprintModule,
  ],

  controllers: [
    AppController,
    AuthController,
    OtpController,
    TokenController,
  ],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply( RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
