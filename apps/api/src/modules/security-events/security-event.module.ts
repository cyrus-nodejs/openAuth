import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SecurityEvent,
  SecurityEventSchema,
} from './schemas/security-event.schema';
import { SecurityEventService } from './security-event.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SecurityEvent.name,
        schema: SecurityEventSchema,
      },
    ]),
  ],
  providers: [SecurityEventService],
  exports: [SecurityEventService],
})
export class SecurityEventModule {}