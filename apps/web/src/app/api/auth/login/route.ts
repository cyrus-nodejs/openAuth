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
  
  interface LoginBody {
    email: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<LoginBody>(
          request,
        );
  
      const result =
        await authFortClient.request<TokenResponse>(
          '/auth/login',
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