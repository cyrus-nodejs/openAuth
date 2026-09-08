import { SetMetadata } from '@nestjs/common';

export const AUTH_LEVEL_KEY =
  'auth:required-level';

export type AuthenticationLevel =
  | 'otp'
  | 'magic_link'
  | 'passkey'
  | 'google'
  | 'step_up';

export const RequireAuthLevel = (
  level: AuthenticationLevel,
) =>
  SetMetadata(
    AUTH_LEVEL_KEY,
    level,
  );