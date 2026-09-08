import { Global, Module } from '@nestjs/common';
import { ReplayProtectionService } from './replay-protection.service';

@Global()
@Module({
  providers: [ReplayProtectionService],
  exports: [ReplayProtectionService],
})
export class ReplayProtectionModule {}