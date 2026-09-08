import {
    Injectable,
    NestMiddleware,
  } from '@nestjs/common';
  import { randomBytes } from 'node:crypto';
  import type { Request, Response, NextFunction } from 'express';
  import {
    requestContextStorage,
  } from './request-context';
  
  @Injectable()
  export class RequestContextMiddleware
    implements NestMiddleware
  {
    use(
      request: Request,
      response: Response,
      next: NextFunction,
    ) {
      const requestId =
        this.getRequestId(request);
  
      response.setHeader(
        'x-request-id',
        requestId,
      );
  
      const context = {
        requestId,
        ip: this.extractIp(request),
        userAgent:
          request.headers['user-agent'],
        fingerprint:
          this.extractFingerprint(request),
      };
  
      requestContextStorage.run(
        context,
        next,
      );
    }
  
    private getRequestId(request: Request) {
      const incoming =
        request.headers['x-request-id'];
  
      if (
        typeof incoming === 'string' &&
        /^[a-zA-Z0-9._:-]{8,128}$/.test(
          incoming,
        )
      ) {
        return incoming;
      }
  
      return `req_${randomBytes(18).toString(
        'base64url',
      )}`;
    }
  
    private extractIp(request: Request) {
      const forwarded =
        request.headers['x-forwarded-for'];
  
      if (typeof forwarded === 'string') {
        return forwarded
          .split(',')[0]
          .trim();
      }
  
      return request.ip;
    }
  
    private extractFingerprint(
      request: Request,
    ) {
      const value =
        request.headers['x-device-fingerprint'];
  
      return typeof value === 'string'
        ? value
        : undefined;
    }
  }