import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
  } from '@nestjs/common';
  
  import { PasskeyService } from './passkey.service';
  import {
    PasskeyAuthenticationService,
  } from './passkey-authentication.service';
  import { PasskeyVerifyDto } from './dto/passkey-verify.dto';
  import { Public } from '../../common/auth/public.decorator';
  
  @Controller('auth/passkey')
  export class PasskeyController {
    constructor(
      private readonly passkeys:
        PasskeyService,
      private readonly authentication:
        PasskeyAuthenticationService,
    ) {}
  
    @Post('register/options')
    @HttpCode(HttpStatus.OK)
    async registrationOptions(
      @Body('userId') userId: string,
    ) {
      return {
        success: true,
        data:
          await this.passkeys.registrationOptions(
            userId,
          ),
      };
    }
  
    @Post('register/verify')
    @HttpCode(HttpStatus.OK)
    async registrationVerify(
      @Body() dto: PasskeyVerifyDto,
    ) {
      return {
        success: true,
        data:
          await this.passkeys.verifyRegistration(
            dto.challengeId,
            dto.credential,
          ),
      };
    }
  
    @Post('login/options')
    @Public()
    @HttpCode(HttpStatus.OK)
    async loginOptions() {
      return {
        success: true,
        data:
          await this.passkeys.authenticationOptions(),
      };
    }
  
    @Post('login/verify')
    @Public()
    @HttpCode(HttpStatus.OK)
    async loginVerify(
      @Body() dto: PasskeyVerifyDto,
    ) {
      return {
        success: true,
        data:
          await this.authentication.authenticate(
            dto.challengeId,
            dto.credential,
          ),
      };
    }
  }