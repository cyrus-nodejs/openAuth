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
    error,
    json,
  } from '@/lib/auth/bff-response';
  
  import type {
    SignupResponse,
  } from '@/lib/auth/contracts';
  
  interface SignupBody {
    email: string;
    displayName?: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<SignupBody>(
          request,
        );
  
      const result =
        await authFortClient.request<SignupResponse>(
          '/auth/signup',
          {
            method: 'POST',
            body: JSON.stringify(
              input,
            ),
          },
        );
  
      return json(result);
    } catch (cause) {
      return error(cause);
    }
  }