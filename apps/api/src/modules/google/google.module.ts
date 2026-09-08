import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { UsersModule } from '../users/users.module';
import { SecurityEventModule } from '../security-events/security-event.module';

@Module({
  imports: [
    UsersModule,
    SecurityEventModule,
  ],
  controllers: [GoogleController],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}