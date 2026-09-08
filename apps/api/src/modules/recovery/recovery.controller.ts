import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
  } from '@nestjs/common';
  import { RecoveryService } from './recovery.service';
  import { RecoveryStartDto } from './dto/recovery-start.dto';
  import { RecoveryCodeDto } from './dto/recovery-code.dto';
  
  @Controller('auth/recovery')
  export class RecoveryController {
    constructor(
      private readonly recovery: RecoveryService,
    ) {}
  
    @Post('start')
    @HttpCode(HttpStatus.OK)
    async start(
      @Body() dto: RecoveryStartDto,
    ) {
      return {
        success: true,
        data: await this.recovery.start(
          dto.email,
        ),
      };
    }
  
    @Post('code/verify')
    @HttpCode(HttpStatus.OK)
    async verifyCode(
      @Body() dto: RecoveryCodeDto,
    ) {
      return {
        success: true,
        data: await this.recovery.verifyCode(
          dto.recoveryAttemptId,
          dto.recoveryCode,
        ),
      };
    }
  }