import { Injectable } from '@nestjs/common';
import {
  getRequestContext,
  setRequestContext,
} from './request-context';

@Injectable()
export class RequestContextService {
  get() {
    return getRequestContext();
  }

  getRequestId() {
    return getRequestContext()?.requestId;
  }

  setAuthenticatedContext(input: {
    userId: string;
    sessionId: string;
  }) {
    setRequestContext(input);
  }
}