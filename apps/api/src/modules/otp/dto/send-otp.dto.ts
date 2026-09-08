import {
    IsIn,
    IsNotEmpty,
    IsString,
  } from 'class-validator';
  
  export class SendOtpDto {
    @IsString()
    @IsNotEmpty()
    attemptId!: string;
  
    @IsIn([
      'login',
      'signup',
      'recovery',
      'step_up',
    ])
    purpose!: string;
  }