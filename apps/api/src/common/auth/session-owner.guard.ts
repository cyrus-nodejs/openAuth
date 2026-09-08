import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { SessionService } from '../../modules/session/session.service';
  
  @Injectable()
  export class SessionOwnerGuard
    implements CanActivate
  {
    constructor(
      private readonly sessions:
        SessionService,
    ) {}
  
    async canActivate(
      context: ExecutionContext,
    ) {
      const request =
        context
          .switchToHttp()
          .getRequest();
  
      const user = request.user;
  
      if (!user) {
        throw new ForbiddenException();
      }
  
      const sessionId =
        request.params.sessionId;
  
      if (!sessionId) {
        return true;
      }
  
      const session =
        await this.sessions.findActive(
          sessionId,
        );
  
      if (
        !session ||
        session.userId.toString() !==
          user.id
      ) {
        throw new ForbiddenException(
          'Session does not belong to user',
        );
      }
  
      return true;
    }
  }