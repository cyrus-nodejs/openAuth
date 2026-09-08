import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
  } from '@nestjs/common';
  import { SignupDto } from './dto/signup.dto';
  import { SignupService } from './signup.service';
  
  @Controller('auth/signup')
  export class SignupController {
    constructor(
      private readonly signup: SignupService,
    ) {}
  
    @Post()
    @HttpCode(HttpStatus.OK)
    async start(@Body() dto: SignupDto) {
      return {
        success: true,
        data: await this.signup.start(dto),
      };
    }
  }