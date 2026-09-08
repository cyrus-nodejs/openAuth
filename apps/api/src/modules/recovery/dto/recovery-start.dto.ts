import {
    IsEmail,
    MaxLength,
  } from 'class-validator';
  
  export class RecoveryStartDto {
    @IsEmail()
    @MaxLength(254)
    email!: string;
  }