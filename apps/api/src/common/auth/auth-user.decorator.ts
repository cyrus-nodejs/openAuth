import {
    createParamDecorator,
    ExecutionContext,
  } from '@nestjs/common';
  
  export interface AuthenticatedRequestUser {
    id: string;
    sessionId: string;
    securityVersion: number;
    authenticationLevel: string;
    jti: string;
  }
  
  export const AuthUser = createParamDecorator(
    (
      property: keyof AuthenticatedRequestUser | undefined,
      context: ExecutionContext,
    ) => {
      const request =
        context
          .switchToHttp()
          .getRequest();
  
      const user =
        request.user as
          | AuthenticatedRequestUser
          | undefined;
  
      if (!user) {
        return undefined;
      }
  
      return property
        ? user[property]
        : user;
    },
  );