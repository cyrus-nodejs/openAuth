import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export class SignupDto {
    @IsEmail()
    @MaxLength(254)
    email!: string;
  
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    displayName?: string;
  }