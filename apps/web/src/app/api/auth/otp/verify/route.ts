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
    OtpVerifyResponse,
  } from '@/lib/auth/contracts';
  
  interface OtpVerifyRequest {
    attemptId: string;
    code: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<OtpVerifyRequest>(
          request,
        );
  
      const result =
        await authFortClient.request<OtpVerifyResponse>(
          '/auth/otp/verify',
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