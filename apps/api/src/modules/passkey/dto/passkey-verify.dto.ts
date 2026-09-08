import {
    IsNotEmpty,
    IsObject,
    IsString,
  } from 'class-validator';
  
  export class PasskeyVerifyDto {
    @IsString()
    @IsNotEmpty()
    challengeId!: string;
  
    @IsObject()
    credential!: Record<string, unknown>;
  }