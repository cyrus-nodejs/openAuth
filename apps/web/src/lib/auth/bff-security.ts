import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';

import {
  createRequestId,
} from '@/lib/security/request-id';

import {
  assertSafeOrigin,
} from '@/lib/security/request-security';

const SAFE_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);

export interface BffSecurityContext {
  requestId: string;
  fingerprint: string | null;
}

function fingerprintMaterial(
  request: NextRequest,
): string {
  const forwarded =
    request.headers.get(
      'x-forwarded-for',
    ) ?? '';

  const userAgent =
    request.headers.get(
      'user-agent',
    ) ?? '';

  const language =
    request.headers.get(
      'accept-language',
    ) ?? '';

  return [
    forwarded.split(',')[0]?.trim(),
    userAgent,
    language,
  ].join('|');
}

export function getFingerprint(
  request: NextRequest,
): string {
  return createHash('sha256')
    .update(
      fingerprintMaterial(request),
    )
    .digest('base64url');
}

export function getSecurityContext(
  request: NextRequest,
): BffSecurityContext {
  return {
    requestId: createRequestId(
      request.headers.get(
        'x-request-id',
      ),
    ),
    fingerprint:
      getFingerprint(request),
  };
}

export function enforceBffSecurity(
  request: NextRequest,
): BffSecurityContext {
  if (
    !SAFE_METHODS.has(
      request.method,
    )
  ) {
    assertSafeOrigin(request);
  }

  return getSecurityContext(
    request,
  );
}

export function securityHeaders(
  response: NextResponse,
  requestId: string,
): NextResponse {
  response.headers.set(
    'x-request-id',
    requestId,
  );

  response.headers.set(
    'cache-control',
    'no-store',
  );

  response.headers.set(
    'x-content-type-options',
    'nosniff',
  );

  response.headers.set(
    'referrer-policy',
    'strict-origin-when-cross-origin',
  );

  return response;
}

export function createCsrfToken(): string {
  return randomBytes(32).toString(
    'base64url',
  );
}