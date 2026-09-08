import {
    Controller,
    Get,
    Query,
    Res,
  } from '@nestjs/common';
  import type { Response } from 'express';
  import { GoogleService } from './google.service';
  
  @Controller('auth/google')
  export class GoogleController {
    constructor(
      private readonly google: GoogleService,
    ) {}
  
    @Get()
    async start(@Res() response: Response) {
      const url =
        await this.google.createAuthorizationUrl();
  
      return response.redirect(url);
    }
  
    @Get('callback')
    async callback(
      @Query('code') code: string,
      @Query('state') state: string,
      @Res() response: Response,
    ) {
      const user =
        await this.google.authenticate(
          code,
          state,
        );
  
      const frontend =
        process.env.FRONTEND_URL ??
        'http://localhost:3001';
  
      return response.redirect(
        `${frontend}/auth/google/success?userId=${encodeURIComponent(
          user._id.toString(),
        )}`,
      );
    }
  }