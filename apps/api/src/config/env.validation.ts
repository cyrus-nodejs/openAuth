import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsUrl({ require_tld: false })
  MONGODB_URI!: string;

  @IsUrl({ require_tld: false })
  REDIS_URL!: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsUrl({ require_tld: false })
  GOOGLE_CALLBACK_URL!: string;

  @IsString()
  SMTP_HOST!: string;

  @IsInt()
  @Min(1)
  SMTP_PORT!: number;

  @IsString()
  SMTP_USER!: string;

  @IsString()
  SMTP_PASSWORD!: string;

  @IsString()
  SMTP_FROM!: string;

  @IsOptional()
  @IsBoolean()
  SMTP_SECURE = true;

  @IsString()
  AUTH_ACCESS_TOKEN_SECRET!: string;

  @IsString()
  AUTH_REFRESH_TOKEN_SECRET!: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  ACCESS_TOKEN_TTL_SECONDS = 900;

  @IsOptional()
  @IsInt()
  @Min(300)
  REFRESH_TOKEN_TTL_SECONDS = 2592000;

  @IsOptional()
  @IsInt()
  @Min(60)
  MAGIC_LINK_TTL_SECONDS = 600;

  @IsOptional()
  @IsInt()
  @Min(60)
  OTP_TTL_SECONDS = 300;

  @IsOptional()
  @IsInt()
  @Min(60)
  AUTH_ATTEMPT_TTL_SECONDS = 900;

  @IsOptional()
  @IsInt()
  @Min(60)
  RECOVERY_ATTEMPT_TTL_SECONDS = 900;

  @IsOptional()
@IsUrl({ require_tld: false })
FRONTEND_URL = 'http://localhost:3001';

@IsOptional()
@IsUrl({ require_tld: false })
WEBAUTHN_ORIGIN = 'http://localhost:3001';

@IsOptional()
@IsString()
WEBAUTHN_RP_ID = 'localhost';


}

export function validateEnvironment(config: Record<string, unknown>) {
  const values = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(values, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('; ')}`,
    );
  }

  return values;
}