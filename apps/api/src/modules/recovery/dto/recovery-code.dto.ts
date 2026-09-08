import {
    IsNotEmpty,
    IsString,
    MaxLength,
  } from 'class-validator';
  
  export class RecoveryCodeDto {
    @IsString()
    @IsNotEmpty()
    recoveryAttemptId!: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    recoveryCode!: string;
  }