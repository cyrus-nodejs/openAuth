import {
    NextRequest,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    body,
  } from '@/lib/auth/request';
  
  import {
    authResponse,
    error,
  } from '@/lib/auth/bff-response';
  
  import type {
    TokenResponse,
  } from '@/lib/auth/contracts';
  
  interface VerifyMagicLink {
    token: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<VerifyMagicLink>(
          request,
        );
  
      const result =
        await authFortClient.request<TokenResponse>(
          '/auth/magic-link/verify',
          {
            method: 'POST',
            body: JSON.stringify(
              input,
            ),
          },
        );
  
      return authResponse(result);
    } catch (cause) {
      return error(cause);
    }
  }